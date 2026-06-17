import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp, mockPrisma, signTestToken } from '../test/setup.js'
import { auditRowContent, computeRowHash } from '../lib/audit-hash.js'
import type { FastifyInstance } from 'fastify'

// Matches AUDIT_SECRET in the mocked config (test/setup.ts).
const AUDIT_SECRET = 'test-audit-secret-key-for-ci-only'

function chainRow(i: number, prev: string | null) {
  const source = {
    staffId: `staff-${i}`,
    patientActorId: null,
    action: 'PATIENT_VIEW',
    resourceType: 'patient',
    resourceId: `patient-${i}`,
    description: `viewed ${i}`,
    phiAccessed: ['name'],
    ipAddress: '127.0.0.1',
    userAgent: 'vitest',
    sessionId: `sess-${i}`,
    success: true,
    errorMessage: null,
    timestamp: new Date(2026, 0, 1, 0, i),
  }
  const hash = computeRowHash(auditRowContent(source), prev, AUDIT_SECRET)
  return { id: `audit-${i}`, ...source, hash, prevHash: prev }
}

/** Build an ascending (genesis-first) chain of n rows. */
function buildChain(n: number) {
  const rows: ReturnType<typeof chainRow>[] = []
  let prev: string | null = null
  for (let i = 0; i < n; i++) {
    const r = chainRow(i, prev)
    rows.push(r)
    prev = r.hash
  }
  return rows
}

describe('GET /api/v1/admin/audit/verify', () => {
  let app: FastifyInstance
  let superAdminToken: string
  let counselorToken: string

  beforeAll(async () => {
    app = await buildApp()
    superAdminToken = signTestToken(app, { id: 'admin-1', email: 'a@t.com', role: 'SUPER_ADMIN', facilityId: null, tokenVersion: 0 })
    counselorToken = signTestToken(app, { id: 'staff-1', email: 'c@t.com', role: 'COUNSELOR', facilityId: 'facility-1', tokenVersion: 0 })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.staff.findUnique.mockResolvedValue({ status: 'ACTIVE', role: 'SUPER_ADMIN', facilityId: null, tokenVersion: 0 })
  })

  const superAuth = () => ({ authorization: `Bearer ${superAdminToken}` })

  it('reports an intact chain as valid', async () => {
    const chain = buildChain(3)
    mockPrisma.auditLog.findMany
      .mockResolvedValueOnce(chain.slice().reverse()) // window (DESC)
      .mockResolvedValueOnce([]) // no anchor → genesis

    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/audit/verify', headers: superAuth() })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.configured).toBe(true)
    expect(body.valid).toBe(true)
    expect(body.count).toBe(3)
  })

  it('flags a tampered record as invalid', async () => {
    const window = buildChain(3).reverse() // DESC
    window[1] = { ...window[1]!, description: 'edited after the fact' } // hash left stale

    mockPrisma.auditLog.findMany
      .mockResolvedValueOnce(window)
      .mockResolvedValueOnce([])

    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/audit/verify', headers: superAuth() })
    expect(res.statusCode).toBe(200)
    expect(res.json().valid).toBe(false)
  })

  it('rejects non-super-admin callers', async () => {
    mockPrisma.staff.findUnique.mockResolvedValue({ status: 'ACTIVE', role: 'COUNSELOR', facilityId: 'facility-1', tokenVersion: 0 })
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/audit/verify',
      headers: { authorization: `Bearer ${counselorToken}` },
    })
    expect(res.statusCode).toBe(403)
  })
})
