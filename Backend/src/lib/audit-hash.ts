import { createHmac } from 'node:crypto'

/**
 * Audit-log tamper-evidence primitives (pure — no DB/config imports so they are
 * trivially testable and reusable by both the writer and a verifier).
 *
 * Each audit row stores a keyed HMAC (`hash`) over its canonical content. From
 * the introduction of hash-chaining, a row also stores `prevHash` — the hash of
 * the immediately-preceding row — and folds it into its own HMAC. That turns the
 * per-row tamper evidence into a chain:
 *   - editing a row in place        → its content HMAC no longer matches
 *   - deleting / reordering a row    → the next row's prevHash no longer links
 *   - inserting a forged row         → it cannot produce a valid HMAC (no secret)
 *
 * Backward compatibility: rows written before chaining have `prevHash = null`.
 * `computeRowHash` with a null prevHash reduces to the original
 * `HMAC(content)`, so those legacy rows still verify by content; the chain-link
 * check is only enforced for rows that actually carry a prevHash.
 */

/** Canonical content fields, in a fixed order, that the HMAC is computed over. */
export interface AuditContentSource {
  staffId?: string | null
  patientActorId?: string | null
  action: string
  resourceType: string
  resourceId?: string | null
  description?: string | null
  phiAccessed?: string[] | null
  ipAddress?: string | null
  userAgent?: string | null
  sessionId?: string | null
  success?: boolean | null
  errorMessage?: string | null
  timestamp: Date | string
}

/**
 * Build the canonical content object the HMAC is taken over. The key order here
 * is the contract between the writer and the verifier — do not reorder, or
 * previously-written hashes will stop verifying.
 */
export function auditRowContent(r: AuditContentSource): Record<string, unknown> {
  return {
    staffId: r.staffId ?? null,
    patientActorId: r.patientActorId ?? null,
    action: r.action,
    resourceType: r.resourceType,
    resourceId: r.resourceId ?? null,
    description: r.description ?? null,
    phiAccessed: r.phiAccessed ?? [],
    ipAddress: r.ipAddress ?? null,
    userAgent: r.userAgent ?? null,
    sessionId: r.sessionId ?? null,
    success: r.success ?? true,
    errorMessage: r.errorMessage ?? null,
    timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
  }
}

/**
 * Keyed HMAC over the canonical content, chained to the previous row's hash.
 * A null/empty prevHash yields HMAC(content) — identical to the pre-chaining
 * scheme, so legacy rows remain verifiable.
 */
export function computeRowHash(
  content: Record<string, unknown>,
  prevHash: string | null,
  secret: string
): string {
  const h = createHmac('sha256', secret).update(JSON.stringify(content))
  if (prevHash) h.update('\n').update(prevHash)
  return h.digest('hex')
}

/** A stored audit row as needed for verification. */
export interface StoredAuditRow extends AuditContentSource {
  id: string
  hash: string | null
  prevHash?: string | null
}

export interface ChainVerifyResult {
  valid: boolean
  /** Number of rows examined. */
  count: number
  /** Number of legacy (pre-chaining) rows verified by content only. */
  legacyCount: number
  /** Hash of the last verified row — carry into the next batch when streaming. */
  lastHash: string | null
  /** Index of the first broken row, if any. */
  brokenAt?: number
  /** Id of the first broken row, if any. */
  brokenId?: string
  reason?: string
}

/**
 * Verify that an ordered list of audit rows forms an intact hash chain.
 * Rows MUST be provided in chain order (ascending timestamp, then id) — the same
 * order the writer used. Rows with a null hash (pre-tamper-evidence) are skipped
 * and reset the running link (they cannot be vouched for).
 *
 * Pass `startPrev` (the hash of the row immediately before this batch) to verify
 * a window/suffix of the chain, or to stream the chain in batches by carrying
 * the previous result's `lastHash`. Leave it null to verify from the genesis.
 */
export function verifyAuditChain(
  rows: StoredAuditRow[],
  secret: string,
  startPrev: string | null = null
): ChainVerifyResult {
  let prev: string | null = startPrev
  let legacyCount = 0

  for (const [i, r] of rows.entries()) {
    // Rows with no hash at all predate tamper-evidence; can't verify, and they
    // break chain continuity for anything that followed.
    if (r.hash == null) {
      prev = null
      continue
    }

    // Content integrity (catches in-place edits) — always checked.
    const expected = computeRowHash(auditRowContent(r), r.prevHash ?? null, secret)
    if (expected !== r.hash) {
      return {
        valid: false,
        count: rows.length,
        legacyCount,
        lastHash: prev,
        brokenAt: i,
        brokenId: r.id,
        reason: 'content hash mismatch — row was modified after it was written',
      }
    }

    if (r.prevHash == null) {
      // Legacy / genesis row: no chain link to enforce.
      legacyCount++
    } else if (r.prevHash !== prev) {
      // Chain link broken — a preceding row was deleted, reordered, or a forged
      // row was inserted.
      return {
        valid: false,
        count: rows.length,
        legacyCount,
        lastHash: prev,
        brokenAt: i,
        brokenId: r.id,
        reason: 'chain link mismatch — a record was deleted, reordered, or inserted',
      }
    }

    prev = r.hash
  }

  return { valid: true, count: rows.length, legacyCount, lastHash: prev }
}
