import { prisma } from './prisma.js'
import type { AuditAction } from '@prisma/client'
import type { FastifyRequest } from 'fastify'
import logger from './logger.js'

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
   * Log an audit entry
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          staffId: this.context.staffId,
          patientActorId: this.context.patientActorId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          description: entry.description,
          phiAccessed: entry.phiAccessed ?? [],
          ipAddress: this.context.request?.ip,
          userAgent: this.context.request?.headers['user-agent'],
          sessionId: this.context.request?.id,
          success: entry.success ?? true,
          errorMessage: entry.errorMessage
        }
      })
    } catch (error) {
      // Audit logging should never throw - log as backup via structured logger
      logger.error('Failed to write audit log', error as Error)
      logger.error('Audit entry that failed to persist', undefined, { entry })
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

  async patientCreate(patientId: string): Promise<void> {
    await this.log({
      action: 'PATIENT_CREATE',
      resourceType: 'patient',
      resourceId: patientId,
      description: 'Created patient record'
    })
  }

  async patientUpdate(patientId: string, fieldsUpdated: string[]): Promise<void> {
    await this.log({
      action: 'PATIENT_UPDATE',
      resourceType: 'patient',
      resourceId: patientId,
      phiAccessed: fieldsUpdated,
      description: `Updated patient record fields: ${fieldsUpdated.join(', ')}`
    })
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

  async messageSend(patientId: string, messageId: string): Promise<void> {
    await this.log({
      action: 'MESSAGE_SEND',
      resourceType: 'message',
      resourceId: messageId,
      description: `Sent message to patient ${patientId}`
    })
  }

  async treatmentView(treatmentPlanId: string): Promise<void> {
    await this.log({
      action: 'TREATMENT_VIEW',
      resourceType: 'treatment_plan',
      resourceId: treatmentPlanId,
      description: 'Viewed treatment plan'
    })
  }

  async treatmentAssign(patientId: string, planId: string): Promise<void> {
    await this.log({
      action: 'TREATMENT_ASSIGN',
      resourceType: 'treatment_assignment',
      resourceId: patientId,
      description: `Assigned treatment plan ${planId} to patient`
    })
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
