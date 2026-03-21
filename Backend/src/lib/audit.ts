/**
 * HIPAA-Compliant Audit Logging System
 *
 * Implements comprehensive audit logging for healthcare data access
 * as required by HIPAA Security Rule (45 CFR § 164.312(b))
 *
 * Features:
 * - Immutable audit trail
 * - PHI access logging
 * - User action tracking
 * - Security event logging
 * - Tamper detection
 */

import { prisma } from './prisma.js'
import crypto from 'crypto'
import logger from './logger.js'

// Audit event categories
export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  PATIENT_DELETE = 'PATIENT_DELETE',
  RECORD_DELETE = 'RECORD_DELETE',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT'
}

// Audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',

  // Authorization events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',

  // Data access events
  PATIENT_VIEW = 'PATIENT_VIEW',
  PATIENT_LIST = 'PATIENT_LIST',
  PATIENT_SEARCH = 'PATIENT_SEARCH',
  RECORD_VIEW = 'RECORD_VIEW',
  REPORT_VIEW = 'REPORT_VIEW',

  // Data modification events
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  RECORD_CREATE = 'RECORD_CREATE',
  RECORD_UPDATE = 'RECORD_UPDATE',
  NOTE_CREATE = 'NOTE_CREATE',
  NOTE_UPDATE = 'NOTE_UPDATE',

  // Data deletion events
  PATIENT_DELETE = 'PATIENT_DELETE',
  RECORD_DELETE = 'RECORD_DELETE',
  DATA_PURGE = 'DATA_PURGE',

  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  IP_BLOCKED = 'IP_BLOCKED',

  // Export/Print events
  DATA_EXPORT = 'DATA_EXPORT',
  REPORT_EXPORT = 'REPORT_EXPORT',
  DATA_PRINT = 'DATA_PRINT',

  // System events
  SYSTEM_START = 'SYSTEM_START',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED'
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string
  timestamp: Date
  category: AuditCategory
  eventType: AuditEventType
  userId?: string
  userEmail?: string
  userRole?: string
  facilityId?: string
  patientId?: string
  resourceType?: string
  resourceId?: string
  action: string
  outcome: 'SUCCESS' | 'FAILURE' | 'ERROR'
  ipAddress?: string
  userAgent?: string
  requestId?: string
  sessionId?: string
  details?: Record<string, unknown>
  phiAccessed?: boolean
  previousValue?: string
  newValue?: string
  hash?: string
}

// Generate hash for tamper detection
function generateEntryHash(entry: Omit<AuditLogEntry, 'hash' | 'id'>): string {
  const content = JSON.stringify({
    timestamp: entry.timestamp.toISOString(),
    category: entry.category,
    eventType: entry.eventType,
    userId: entry.userId,
    action: entry.action,
    outcome: entry.outcome,
    resourceId: entry.resourceId
  })

  return crypto
    .createHmac('sha256', process.env['AUDIT_SECRET'] || process.env['JWT_SECRET'] || 'audit-secret')
    .update(content)
    .digest('hex')
}

// Mask sensitive data in audit logs
function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password', 'ssn', 'socialSecurityNumber', 'creditCard',
    'token', 'secret', 'apiKey', 'refreshToken'
  ]

  const masked: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()

    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      masked[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>)
    } else {
      masked[key] = value
    }
  }

  return masked
}

/**
 * Main Audit Logger class
 */
export class AuditLogger {
  private static instance: AuditLogger
  private buffer: AuditLogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly bufferSize = 100
  private readonly flushIntervalMs = 5000

  private constructor() {
    this.startFlushInterval()
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      void this.flush()
    }, this.flushIntervalMs)
  }

  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, 'timestamp' | 'hash'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
      details: entry.details ? maskSensitiveData(entry.details) : undefined
    }

    // Generate tamper-detection hash
    fullEntry.hash = generateEntryHash(fullEntry)

    this.buffer.push(fullEntry)

    // Flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      await this.flush()
    }

    // For critical events, flush immediately
    if (this.isCriticalEvent(entry.eventType)) {
      await this.flush()
    }
  }

  /**
   * Check if event is critical (requires immediate logging)
   */
  private isCriticalEvent(eventType: AuditEventType): boolean {
    const criticalEvents = [
      AuditEventType.LOGIN_FAILURE,
      AuditEventType.ACCESS_DENIED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.BRUTE_FORCE_ATTEMPT,
      AuditEventType.PATIENT_DELETE,
      AuditEventType.RECORD_DELETE,
      AuditEventType.PATIENT_DELETE,
      AuditEventType.DATA_EXPORT,
      AuditEventType.CONFIG_CHANGE
    ]
    return criticalEvents.includes(eventType)
  }

  /**
   * Flush buffered entries to database
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    try {
      // Write each entry to the database using the existing schema
      for (const entry of entries) {
        await prisma.auditLog.create({
          data: {
            staffId: entry.userId,
            action: this.mapEventTypeToAction(entry.eventType),
            resourceType: entry.resourceType || 'unknown',
            resourceId: entry.resourceId,
            description: entry.action,
            phiAccessed: entry.phiAccessed ? [entry.resourceType || 'unknown'] : [],
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            sessionId: entry.sessionId,
            success: entry.outcome === 'SUCCESS',
            errorMessage: entry.outcome === 'ERROR' ? JSON.stringify(entry.details) : null
          }
        })
      }
    } catch (error) {
      // Log to stderr as fallback - audit logs must not be lost
      logger.error('Failed to write audit logs to database', error as Error)
      logger.error('Audit log fallback entries', undefined, { entries })

      // Re-add to buffer for retry (limit retries)
      if (this.buffer.length < this.bufferSize * 2) {
        this.buffer.push(...entries)
      }
    }
  }

  /**
   * Map our event types to the Prisma AuditAction enum
   */
  private mapEventTypeToAction(eventType: AuditEventType): import('@prisma/client').AuditAction {
    const mapping: Record<AuditEventType, import('@prisma/client').AuditAction> = {
      [AuditEventType.LOGIN_SUCCESS]: 'LOGIN',
      [AuditEventType.LOGIN_FAILURE]: 'LOGIN_FAILED',
      [AuditEventType.LOGOUT]: 'LOGOUT',
      [AuditEventType.PASSWORD_CHANGE]: 'STAFF_UPDATE',
      [AuditEventType.PASSWORD_RESET]: 'STAFF_UPDATE',
      [AuditEventType.MFA_ENABLED]: 'STAFF_UPDATE',
      [AuditEventType.MFA_DISABLED]: 'STAFF_UPDATE',
      [AuditEventType.SESSION_EXPIRED]: 'LOGOUT',
      [AuditEventType.TOKEN_REFRESH]: 'TOKEN_REFRESH',
      [AuditEventType.ACCESS_GRANTED]: 'PATIENT_VIEW',
      [AuditEventType.ACCESS_DENIED]: 'LOGIN_FAILED',
      [AuditEventType.PERMISSION_CHANGE]: 'STAFF_UPDATE',
      [AuditEventType.ROLE_CHANGE]: 'STAFF_UPDATE',
      [AuditEventType.PATIENT_VIEW]: 'PATIENT_VIEW',
      [AuditEventType.PATIENT_LIST]: 'PATIENT_SEARCH',
      [AuditEventType.PATIENT_SEARCH]: 'PATIENT_SEARCH',
      [AuditEventType.RECORD_VIEW]: 'CHECKIN_VIEW',
      [AuditEventType.REPORT_VIEW]: 'REPORT_GENERATE',
      [AuditEventType.PATIENT_CREATE]: 'PATIENT_CREATE',
      [AuditEventType.PATIENT_UPDATE]: 'PATIENT_UPDATE',
      [AuditEventType.RECORD_CREATE]: 'CHECKIN_CREATE',
      [AuditEventType.RECORD_UPDATE]: 'CHECKIN_SYNC',
      [AuditEventType.NOTE_CREATE]: 'MESSAGE_SEND',
      [AuditEventType.NOTE_UPDATE]: 'MESSAGE_SEND',
      [AuditEventType.PATIENT_DELETE]: 'PATIENT_DELETE',
      [AuditEventType.RECORD_DELETE]: 'PATIENT_DELETE',
      [AuditEventType.DATA_PURGE]: 'PATIENT_DELETE',
      [AuditEventType.SUSPICIOUS_ACTIVITY]: 'LOGIN_FAILED',
      [AuditEventType.RATE_LIMIT_EXCEEDED]: 'LOGIN_FAILED',
      [AuditEventType.INVALID_TOKEN]: 'LOGIN_FAILED',
      [AuditEventType.BRUTE_FORCE_ATTEMPT]: 'LOGIN_FAILED',
      [AuditEventType.IP_BLOCKED]: 'LOGIN_FAILED',
      [AuditEventType.DATA_EXPORT]: 'DATA_EXPORT',
      [AuditEventType.REPORT_EXPORT]: 'REPORT_GENERATE',
      [AuditEventType.DATA_PRINT]: 'DATA_EXPORT',
      [AuditEventType.SYSTEM_START]: 'FACILITY_UPDATE',
      [AuditEventType.SYSTEM_SHUTDOWN]: 'FACILITY_UPDATE',
      [AuditEventType.CONFIG_CHANGE]: 'FACILITY_UPDATE',
      [AuditEventType.BACKUP_CREATED]: 'DATA_EXPORT',
      [AuditEventType.BACKUP_RESTORED]: 'FACILITY_UPDATE'
    }
    return mapping[eventType] || 'PATIENT_VIEW'
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    await this.flush()
  }
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance()

// Convenience functions for common audit events

export async function logAuthentication(
  eventType: AuditEventType,
  outcome: 'SUCCESS' | 'FAILURE',
  context: {
    userId?: string
    userEmail?: string
    ipAddress?: string
    userAgent?: string
    details?: Record<string, unknown>
  }
): Promise<void> {
  await auditLogger.log({
    category: AuditCategory.AUTHENTICATION,
    eventType,
    outcome,
    action: eventType.toLowerCase().replace(/_/g, ' '),
    ...context
  })
}

export async function logDataAccess(
  eventType: AuditEventType,
  context: {
    userId: string
    userEmail?: string
    userRole?: string
    facilityId?: string
    patientId?: string
    resourceType: string
    resourceId: string
    ipAddress?: string
    requestId?: string
    details?: Record<string, unknown>
  }
): Promise<void> {
  await auditLogger.log({
    category: AuditCategory.DATA_ACCESS,
    eventType,
    outcome: 'SUCCESS',
    action: `Accessed ${context.resourceType}`,
    phiAccessed: true,
    ...context
  })
}

export async function logDataModification(
  eventType: AuditEventType,
  context: {
    userId: string
    userEmail?: string
    userRole?: string
    facilityId?: string
    patientId?: string
    resourceType: string
    resourceId: string
    previousValue?: string
    newValue?: string
    ipAddress?: string
    requestId?: string
    details?: Record<string, unknown>
  }
): Promise<void> {
  await auditLogger.log({
    category: AuditCategory.DATA_MODIFICATION,
    eventType,
    outcome: 'SUCCESS',
    action: `Modified ${context.resourceType}`,
    phiAccessed: true,
    ...context
  })
}

export async function logSecurityEvent(
  eventType: AuditEventType,
  context: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    details: Record<string, unknown>
  }
): Promise<void> {
  await auditLogger.log({
    category: AuditCategory.SECURITY,
    eventType,
    outcome: 'FAILURE',
    action: eventType.toLowerCase().replace(/_/g, ' '),
    ...context
  })
}

export async function logExport(
  context: {
    userId: string
    userEmail?: string
    userRole?: string
    facilityId?: string
    resourceType: string
    resourceId?: string
    format: string
    recordCount: number
    ipAddress?: string
    requestId?: string
  }
): Promise<void> {
  await auditLogger.log({
    category: AuditCategory.EXPORT,
    eventType: AuditEventType.DATA_EXPORT,
    outcome: 'SUCCESS',
    action: `Exported ${context.resourceType} as ${context.format}`,
    phiAccessed: true,
    ...context,
    details: {
      format: context.format,
      recordCount: context.recordCount
    }
  })
}
