import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  auditRowContent,
  computeRowHash,
  verifyAuditChain,
  type StoredAuditRow,
} from './audit-hash.js'

const SECRET = 'unit-test-audit-secret'

function makeRow(i: number, prevHash: string | null): StoredAuditRow {
  const source = {
    staffId: `staff-${i}`,
    patientActorId: null,
    action: 'PATIENT_VIEW',
    resourceType: 'patient',
    resourceId: `patient-${i}`,
    description: `viewed patient ${i}`,
    phiAccessed: ['name', 'dob'],
    ipAddress: '127.0.0.1',
    userAgent: 'vitest',
    sessionId: `sess-${i}`,
    success: true,
    errorMessage: null,
    timestamp: new Date(2026, 0, 1, 0, i), // distinct + ordered
  }
  const hash = computeRowHash(auditRowContent(source), prevHash, SECRET)
  return { id: `audit-${i}`, ...source, hash, prevHash }
}

function makeChain(n: number, startPrev: string | null = null): StoredAuditRow[] {
  const rows: StoredAuditRow[] = []
  let prev = startPrev
  for (let i = 0; i < n; i++) {
    const r = makeRow(i, prev)
    rows.push(r)
    prev = r.hash
  }
  return rows
}

describe('audit-hash chain', () => {
  it('verifies an intact chain', () => {
    const res = verifyAuditChain(makeChain(5), SECRET)
    expect(res.valid).toBe(true)
    expect(res.count).toBe(5)
  })

  it('detects an in-place content edit (hash left unchanged)', () => {
    const rows = makeChain(5)
    rows[2] = { ...rows[2]!, description: 'TAMPERED — exfiltrated PHI' }
    const res = verifyAuditChain(rows, SECRET)
    expect(res.valid).toBe(false)
    expect(res.brokenAt).toBe(2)
    expect(res.brokenId).toBe('audit-2')
    expect(res.reason).toMatch(/content/i)
  })

  it('detects a deleted record', () => {
    const rows = makeChain(5)
    rows.splice(2, 1) // attacker removes one audit record
    const res = verifyAuditChain(rows, SECRET)
    expect(res.valid).toBe(false)
    expect(res.reason).toMatch(/deleted|reordered|inserted/i)
  })

  it('detects reordering', () => {
    const rows = makeChain(5)
    ;[rows[2], rows[3]] = [rows[3]!, rows[2]!]
    expect(verifyAuditChain(rows, SECRET).valid).toBe(false)
  })

  it('detects a forged inserted record (no valid HMAC possible without the secret)', () => {
    const rows = makeChain(5)
    const forged = { ...makeRow(99, rows[1]!.hash), hash: 'deadbeefdeadbeef' }
    rows.splice(2, 0, forged)
    const res = verifyAuditChain(rows, SECRET)
    expect(res.valid).toBe(false)
    expect(res.brokenAt).toBe(2)
  })

  it('detects tampering with a wrong secret (different keyholder)', () => {
    expect(verifyAuditChain(makeChain(3), 'a-different-secret').valid).toBe(false)
  })

  it('verifies a windowed batch with the correct anchor, rejects a wrong one', () => {
    const rows = makeChain(6)
    const suffix = rows.slice(3)
    expect(verifyAuditChain(suffix, SECRET, rows[2]!.hash).valid).toBe(true)
    expect(verifyAuditChain(suffix, SECRET, 'wrong-anchor').valid).toBe(false)
  })

  it('streams in batches via lastHash carry-over', () => {
    const rows = makeChain(6)
    const first = verifyAuditChain(rows.slice(0, 3), SECRET)
    expect(first.valid).toBe(true)
    const second = verifyAuditChain(rows.slice(3), SECRET, first.lastHash)
    expect(second.valid).toBe(true)
  })

  it('verifies legacy (pre-chaining) rows by content only, and flags edits', () => {
    const legacy = [makeRow(0, null), makeRow(1, null)] // both prevHash null
    const res = verifyAuditChain(legacy, SECRET)
    expect(res.valid).toBe(true)
    expect(res.legacyCount).toBe(2)
    legacy[1] = { ...legacy[1]!, resourceId: 'swapped' }
    expect(verifyAuditChain(legacy, SECRET).valid).toBe(false)
  })

  it('verifies a legacy tail followed by chained rows (deployment transition)', () => {
    const legacy = makeRow(0, null)
    const chained = makeRow(1, legacy.hash)
    expect(verifyAuditChain([legacy, chained], SECRET).valid).toBe(true)
  })

  it('skips unhashed rows (pre-tamper-evidence) without failing', () => {
    const unhashed = { ...makeRow(50, null), hash: null }
    const res = verifyAuditChain([unhashed, makeRow(0, null), makeRow(1, null)], SECRET)
    expect(res.valid).toBe(true)
  })

  it('computeRowHash with a null prevHash matches the legacy content-only HMAC', () => {
    const content = auditRowContent(makeRow(7, null))
    const legacyHmac = createHmac('sha256', SECRET).update(JSON.stringify(content)).digest('hex')
    expect(computeRowHash(content, null, SECRET)).toBe(legacyHmac)
  })
})
