import { Prisma, type AuditAction } from '@prisma/client'
import { prisma } from './prisma.js'
import type { FastifyRequest } from 'fastify'
import logger from './logger.js'
import { config } from '../config/env.js'
import { auditRowContent, computeRowHash } from './audit-hash.js'

// Fixed key for the Postgres advisory lock that serializes audit-chain writes,
// keeping the hash chain strictly linear under concurrent requests.
const AUDIT_CHAIN_LOCK_KEY = 4815162342n

interface AuditContext {
  staffId?: string
  patientActorId?: string
  request?: FastifyRequest
}

interface AuditEntry {
  action: AuditAction
  resourceType: string
  resourceId?: string
  description?: string
  phiAccessed?: string[]
  success?: boolean
  errorMessage?: string
  // When true, a failure to persist this audit record fails the request
  // rather than being swallowed. Only safe for actions where the audited
  // operation is performed in the SAME transaction as the audit write (so a
  // failure rolls the operation back). Do NOT set this for an audit logged
  // after a separate, already-committed write — that would return an error to
  // the client while the write stands, risking duplicate/partial state.
  critical?: boolean
}

/**
 * HIPAA Audit Logger
 *
 * Logs all access to Protected Health Information (PHI).
 * Required for HIPAA compliance - must log:
 * - Who accessed the data
 * - What was accessed
 * - When it was accessed
 * - From where (IP, user agent)
 * - Success/failure of the access
 */
export class AuditLogger {
  private context: AuditContext

  constructor(context: AuditContext = {}) {
    this.context = context
  }

  /**
   * Create a new audit logger bound to a request
   */
  static fromRequest(request: FastifyRequest, staffId?: string): AuditLogger {
    return new AuditLogger({
      request,
      staffId
    })
  }

  /**
   * Log an audit entry.
   *
   * Pass `tx` to write the audit row inside a caller-owned transaction, so the
   * audited operation and its audit record commit (or roll back) atomically —
   * the only safe way to use `entry.critical`. Without `tx`, the write runs in
   * its own transaction.
   *
   * Each row is hash-chained to the previous one (see audit-hash.ts). Writes are
   * serialized with a Postgres advisory lock so the chain stays linear.
   */
  async log(entry: AuditEntry, tx?: Prisma.TransactionClient): Promise<void> {
    const base = {
      staffId: this.context.staffId ?? null,
      patientActorId: this.context.patientActorId ?? null,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      description: entry.description ?? null,
      phiAccessed: entry.phiAccessed ?? [],
      ipAddress: this.context.request?.ip ?? null,
      userAgent: this.context.request?.headers['user-agent'] ?? null,
      sessionId: this.context.request?.id ?? null,
      success: entry.success ?? true,
      errorMessage: entry.errorMessage ?? null,
    }
    const secret = config.AUDIT_SECRET

    const writeWith = async (db: Prisma.TransactionClient): Promise<void> => {
      let prevHash: string | null = null
      if (secret) {
        // Serialize chain writes (xact-scoped advisory lock, auto-released on
        // commit/rollback) so concurrent audits can't fork the chain.
        await db.$queryRaw`SELECT pg_advisory_xact_lock(${AUDIT_CHAIN_LOCK_KEY})`
        const last = await db.auditLog.findFirst({
          orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
          select: { hash: true },
        })
        prevHash = last?.hash ?? null
      }
      // Capture the timestamp inside the lock so it reflects the serialized
      // write order — keeps the stored chain order consistent with the
      // (timestamp, id) order the verifier walks.
      const timestamp = new Date()
      const content = auditRowContent({ ...base, timestamp })
      await db.auditLog.create({
        data: {
          ...base,
          timestamp,
          prevHash,
          hash: secret ? computeRowHash(content, prevHash, secret) : null,
        },
      })
    }

    try {
      if (tx) {
        await writeWith(tx)
      } else {
        await prisma.$transaction(writeWith)
      }
    } catch (error) {
      // Always surface the failure to the structured logger.
      logger.error('Failed to write audit log', error as Error)
      logger.error('Audit entry that failed to persist', undefined, { entry })
      // For high-sensitivity actions, a missing audit record means the action
      // must not be treated as completed — fail the request.
      if (entry.critical) {
        throw error
      }
    }
  }

  // Convenience methods for common actions

  async loginSuccess(staffId: string): Promise<void> {
    await this.log({
      action: 'LOGIN',
      resourceType: 'staff',
      resourceId: staffId,
      description: 'Staff login successful'
    })
  }

  async loginFailed(email: string, reason: string): Promise<void> {
    await this.log({
      action: 'LOGIN_FAILED',
      resourceType: 'staff',
      description: `Login failed for ${email}: ${reason}`,
      success: false,
      errorMessage: reason
    })
  }

  async logout(staffId: string): Promise<void> {
    await this.log({
      action: 'LOGOUT',
      resourceType: 'staff',
      resourceId: staffId,
      description: 'Staff logout'
    })
  }

  async patientView(patientId: string, fieldsAccessed: string[]): Promise<void> {
    await this.log({
      action: 'PATIENT_VIEW',
      resourceType: 'patient',
      resourceId: patientId,
      phiAccessed: fieldsAccessed,
      description: `Viewed patient record`
    })
  }

  async patientCreate(patientId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await this.log({
      action: 'PATIENT_CREATE',
      resourceType: 'patient',
      resourceId: patientId,
      description: 'Created patient record',
      critical: !!tx
    }, tx)
  }

  async patientUpdate(patientId: string, fieldsUpdated: string[], tx?: Prisma.TransactionClient): Promise<void> {
    await this.log({
      action: 'PATIENT_UPDATE',
      resourceType: 'patient',
      resourceId: patientId,
      phiAccessed: fieldsUpdated,
      description: `Updated patient record fields: ${fieldsUpdated.join(', ')}`,
      critical: !!tx
    }, tx)
  }

  async patientSearch(query: string, resultCount: number): Promise<void> {
    await this.log({
      action: 'PATIENT_SEARCH',
      resourceType: 'patient',
      description: `Searched patients with query "${query}", found ${resultCount} results`
    })
  }

  async checkInView(patientId: string, checkInId: string): Promise<void> {
    await this.log({
      action: 'CHECKIN_VIEW',
      resourceType: 'check_in',
      resourceId: checkInId,
      phiAccessed: ['mood', 'notes', 'halt'],
      description: `Viewed check-in for patient ${patientId}`
    })
  }

  async checkInSync(patientId: string, count: number): Promise<void> {
    await this.log({
      action: 'CHECKIN_SYNC',
      resourceType: 'check_in',
      resourceId: patientId,
      description: `Synced ${count} check-ins from patient device`
    })
  }

  async messageView(conversationPatientId: string): Promise<void> {
    await this.log({
      action: 'MESSAGE_VIEW',
      resourceType: 'message',
      resourceId: conversationPatientId,
      phiAccessed: ['message_content'],
      description: `Viewed messages with patient ${conversationPatientId}`
    })
  }

  async messageSend(patientId: string, messageId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await this.log({
      action: 'MESSAGE_SEND',
      resourceType: 'message',
      resourceId: messageId,
      description: `Sent message to patient ${patientId}`,
      critical: !!tx
    }, tx)
  }

  async treatmentView(treatmentPlanId: string): Promise<void> {
    await this.log({
      action: 'TREATMENT_VIEW',
      resourceType: 'treatment_plan',
      resourceId: treatmentPlanId,
      description: 'Viewed treatment plan'
    })
  }

  async treatmentAssign(patientId: string, planId: string, tx?: Prisma.TransactionClient): Promise<void> {
    await this.log({
      action: 'TREATMENT_ASSIGN',
      resourceType: 'treatment_assignment',
      resourceId: patientId,
      description: `Assigned treatment plan ${planId} to patient`,
      critical: !!tx
    }, tx)
  }

  async consentCreate(patientId: string, consentId: string, consentType: string): Promise<void> {
    await this.log({
      action: 'CONSENT_CREATE',
      resourceType: 'consent',
      resourceId: consentId,
      description: `Created ${consentType} consent for patient ${patientId}`
    })
  }

  async consentRevoke(patientId: string, consentId: string): Promise<void> {
    await this.log({
      action: 'CONSENT_REVOKE',
      resourceType: 'consent',
      resourceId: consentId,
      description: `Revoked consent for patient ${patientId}`
    })
  }

  async dataExport(resourceType: string, recordCount: number): Promise<void> {
    await this.log({
      action: 'DATA_EXPORT',
      resourceType,
      description: `Exported ${recordCount} ${resourceType} records`
    })
  }
}

// Singleton for quick logging without context
export const auditLog = new AuditLogger()
