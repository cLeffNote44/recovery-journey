/* eslint-disable no-console -- intentional dev diagnostics; stripped from prod builds */
import api from './api'

/**
 * HIPAA-compliant Audit Logging Service
 *
 * HIPAA requires covered entities to implement hardware, software, and/or
 * procedural mechanisms that record and examine activity in information
 * systems that contain or use electronic protected health information (ePHI).
 *
 * This service tracks:
 * - Who accessed what data (user identification)
 * - When they accessed it (timestamp)
 * - What they did with it (action type)
 * - The result of the action (success/failure)
 * - Client context (IP, user agent, session ID)
 *
 * All audit logs are sent to the server for secure storage and cannot be
 * modified or deleted by end users.
 */

// =============================================================================
// TYPES
// =============================================================================

export type AuditAction =
  // Authentication events
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'SESSION_TIMEOUT'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  // Patient data access
  | 'PATIENT_VIEW'
  | 'PATIENT_CREATE'
  | 'PATIENT_UPDATE'
  | 'PATIENT_DELETE'
  | 'PATIENT_LIST_VIEW'
  | 'PATIENT_SEARCH'
  | 'PATIENT_EXPORT'
  // Message access
  | 'MESSAGE_VIEW'
  | 'MESSAGE_SEND'
  | 'MESSAGE_DELETE'
  | 'CONVERSATION_VIEW'
  // Document access
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_CREATE'
  | 'DOCUMENT_UPDATE'
  | 'DOCUMENT_DELETE'
  | 'DOCUMENT_DOWNLOAD'
  // Check-in data
  | 'CHECKIN_VIEW'
  | 'CHECKIN_LIST_VIEW'
  // Treatment/clinical data
  | 'TREATMENT_PLAN_VIEW'
  | 'TREATMENT_PLAN_UPDATE'
  | 'CLINICAL_NOTE_VIEW'
  | 'CLINICAL_NOTE_CREATE'
  | 'CLINICAL_NOTE_UPDATE'
  // Administrative actions
  | 'FACILITY_VIEW'
  | 'FACILITY_CREATE'
  | 'FACILITY_UPDATE'
  | 'CLINICIAN_CREATE'
  | 'CLINICIAN_UPDATE'
  | 'CLINICIAN_DEACTIVATE'
  | 'SETTINGS_UPDATE'
  // Data export/reports
  | 'REPORT_GENERATE'
  | 'DATA_EXPORT'

export type AuditResourceType =
  | 'patient'
  | 'message'
  | 'conversation'
  | 'document'
  | 'checkin'
  | 'treatment_plan'
  | 'clinical_note'
  | 'facility'
  | 'clinician'
  | 'user'
  | 'report'
  | 'settings'
  | 'system'

export type AuditResult = 'success' | 'failure' | 'partial'

export interface AuditLogEntry {
  /** The action that was performed */
  action: AuditAction
  /** Type of resource accessed */
  resourceType: AuditResourceType
  /** ID of the resource (e.g., patient ID) - null for list views */
  resourceId?: string | null
  /** Human-readable description of the action */
  description?: string
  /** Result of the action */
  result: AuditResult
  /** Error message if action failed */
  errorMessage?: string
  /** Additional metadata about the action */
  metadata?: Record<string, unknown>
  /** PHI fields that were accessed (for data access tracking) */
  phiFieldsAccessed?: string[]
}

interface AuditContext {
  userId: string
  userEmail: string
  userRole: string
  facilityId?: string
  sessionId: string
  ipAddress?: string
  userAgent: string
}

// StoredAuditEntry is used when processing entries from the server
// Exported for potential future use in admin views
export type StoredAuditEntry = AuditLogEntry & {
  id: string
  timestamp: string
  context: AuditContext
}

// =============================================================================
// AUDIT SERVICE
// =============================================================================

class AuditLogService {
  private context: Partial<AuditContext> = {}
  private queue: AuditLogEntry[] = []
  private isProcessing = false
  private flushInterval: ReturnType<typeof setInterval> | null = null

  // Start the periodic flush
  constructor() {
    this.initializeContext()
    this.startFlushInterval()
  }

  /**
   * Initialize client-side context (user agent, etc.)
   */
  private initializeContext() {
    this.context = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionId: this.generateSessionId(),
    }
  }

  /**
   * Generate a unique session ID for tracking
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Set the current user context (called on login)
   */
  setUserContext(user: { id: string; email: string; role: string; facilityId?: string }) {
    this.context = {
      ...this.context,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      facilityId: user.facilityId,
    }
  }

  /**
   * Clear user context (called on logout)
   */
  clearUserContext() {
    const sessionId = this.generateSessionId()
    this.context = {
      userAgent: this.context.userAgent,
      sessionId,
    }
  }

  /**
   * Start periodic flush of audit queue
   */
  private startFlushInterval() {
    // Flush every 5 seconds if there are entries
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0 && !this.isProcessing) {
        this.flush()
      }
    }, 5000)
  }

  /**
   * Stop the flush interval (for cleanup)
   */
  stopFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Add to queue
    this.queue.push(entry)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Audit Log]', {
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        result: entry.result,
        description: entry.description,
      })
    }

    // Immediately flush for critical events
    const criticalActions: AuditAction[] = [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PATIENT_CREATE',
      'PATIENT_DELETE',
      'DOCUMENT_DELETE',
      'DATA_EXPORT',
    ]

    if (criticalActions.includes(entry.action)) {
      await this.flush()
    }
  }

  /**
   * Flush the queue to the server
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const entriesToSend = [...this.queue]
    this.queue = []

    try {
      await api.post('/audit/logs', {
        entries: entriesToSend.map((entry) => ({
          ...entry,
          timestamp: new Date().toISOString(),
          context: this.context,
        })),
      })
    } catch (error) {
      // Put entries back in queue on failure
      this.queue = [...entriesToSend, ...this.queue]

      // Keep queue from growing too large
      if (this.queue.length > 100) {
        this.queue = this.queue.slice(-100)
      }

      // Log error locally
      if (process.env.NODE_ENV === 'development') {
        console.error('[Audit Log] Failed to send audit logs:', error)
      }
    } finally {
      this.isProcessing = false
    }
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Log a successful login
   */
  loginSuccess(userId: string, metadata?: Record<string, unknown>) {
    return this.log({
      action: 'LOGIN_SUCCESS',
      resourceType: 'user',
      resourceId: userId,
      result: 'success',
      description: 'User logged in successfully',
      metadata,
    })
  }

  /**
   * Log a failed login attempt
   */
  loginFailure(email: string, reason: string) {
    return this.log({
      action: 'LOGIN_FAILURE',
      resourceType: 'user',
      resourceId: null,
      result: 'failure',
      description: `Login failed for email: ${email}`,
      errorMessage: reason,
      metadata: { attemptedEmail: email },
    })
  }

  /**
   * Log a logout event
   */
  logout(reason: 'manual' | 'session_timeout' | 'forced' = 'manual') {
    return this.log({
      action: reason === 'session_timeout' ? 'SESSION_TIMEOUT' : 'LOGOUT',
      resourceType: 'user',
      resourceId: this.context.userId,
      result: 'success',
      description: `User logged out: ${reason}`,
      metadata: { reason },
    })
  }

  /**
   * Log viewing a patient record
   */
  patientView(patientId: string, phiFieldsAccessed?: string[]) {
    return this.log({
      action: 'PATIENT_VIEW',
      resourceType: 'patient',
      resourceId: patientId,
      result: 'success',
      description: 'Viewed patient record',
      phiFieldsAccessed,
    })
  }

  /**
   * Log viewing the patient list
   */
  patientListView(filters?: Record<string, unknown>) {
    return this.log({
      action: 'PATIENT_LIST_VIEW',
      resourceType: 'patient',
      resourceId: null,
      result: 'success',
      description: 'Viewed patient list',
      metadata: { filters },
    })
  }

  /**
   * Log searching for patients
   */
  patientSearch(query: string, resultCount: number) {
    return this.log({
      action: 'PATIENT_SEARCH',
      resourceType: 'patient',
      resourceId: null,
      result: 'success',
      description: `Searched patients: "${query}"`,
      metadata: { query, resultCount },
    })
  }

  /**
   * Log creating a patient
   */
  patientCreate(patientId: string) {
    return this.log({
      action: 'PATIENT_CREATE',
      resourceType: 'patient',
      resourceId: patientId,
      result: 'success',
      description: 'Created new patient record',
    })
  }

  /**
   * Log updating a patient
   */
  patientUpdate(patientId: string, fieldsUpdated: string[]) {
    return this.log({
      action: 'PATIENT_UPDATE',
      resourceType: 'patient',
      resourceId: patientId,
      result: 'success',
      description: 'Updated patient record',
      metadata: { fieldsUpdated },
      phiFieldsAccessed: fieldsUpdated,
    })
  }

  /**
   * Log viewing a conversation
   */
  conversationView(patientId: string) {
    return this.log({
      action: 'CONVERSATION_VIEW',
      resourceType: 'conversation',
      resourceId: patientId,
      result: 'success',
      description: 'Viewed patient conversation',
    })
  }

  /**
   * Log sending a message
   */
  messageSend(patientId: string) {
    return this.log({
      action: 'MESSAGE_SEND',
      resourceType: 'message',
      resourceId: patientId,
      result: 'success',
      description: 'Sent message to patient',
    })
  }

  /**
   * Log viewing a document
   */
  documentView(documentId: string, documentType: string) {
    return this.log({
      action: 'DOCUMENT_VIEW',
      resourceType: 'document',
      resourceId: documentId,
      result: 'success',
      description: `Viewed document: ${documentType}`,
      metadata: { documentType },
    })
  }

  /**
   * Log downloading a document
   */
  documentDownload(documentId: string, documentType: string) {
    return this.log({
      action: 'DOCUMENT_DOWNLOAD',
      resourceType: 'document',
      resourceId: documentId,
      result: 'success',
      description: `Downloaded document: ${documentType}`,
      metadata: { documentType },
    })
  }

  /**
   * Log exporting data
   */
  dataExport(exportType: string, recordCount: number, filters?: Record<string, unknown>) {
    return this.log({
      action: 'DATA_EXPORT',
      resourceType: 'report',
      resourceId: null,
      result: 'success',
      description: `Exported ${exportType} data`,
      metadata: { exportType, recordCount, filters },
    })
  }

  /**
   * Log viewing check-in data
   */
  checkinView(checkinId: string, patientId: string) {
    return this.log({
      action: 'CHECKIN_VIEW',
      resourceType: 'checkin',
      resourceId: checkinId,
      result: 'success',
      description: 'Viewed patient check-in',
      metadata: { patientId },
    })
  }

  /**
   * Log a generic action with custom parameters
   */
  custom(
    action: AuditAction,
    resourceType: AuditResourceType,
    resourceId: string | null,
    options: {
      result?: AuditResult
      description?: string
      errorMessage?: string
      metadata?: Record<string, unknown>
      phiFieldsAccessed?: string[]
    } = {}
  ) {
    return this.log({
      action,
      resourceType,
      resourceId,
      result: options.result || 'success',
      description: options.description,
      errorMessage: options.errorMessage,
      metadata: options.metadata,
      phiFieldsAccessed: options.phiFieldsAccessed,
    })
  }
}

// Export singleton instance
export const auditLog = new AuditLogService()

// Export class for testing
export { AuditLogService }

// React hook for audit logging
import { useCallback } from 'react'

/**
 * React hook for audit logging
 *
 * @example
 * ```tsx
 * function PatientPage({ patientId }) {
 *   const { logPatientView } = useAuditLog()
 *
 *   useEffect(() => {
 *     logPatientView(patientId)
 *   }, [patientId])
 *
 *   return <PatientDetails />
 * }
 * ```
 */
export function useAuditLog() {
  const logPatientView = useCallback((patientId: string, phiFieldsAccessed?: string[]) => {
    auditLog.patientView(patientId, phiFieldsAccessed)
  }, [])

  const logPatientListView = useCallback((filters?: Record<string, unknown>) => {
    auditLog.patientListView(filters)
  }, [])

  const logPatientSearch = useCallback((query: string, resultCount: number) => {
    auditLog.patientSearch(query, resultCount)
  }, [])

  const logConversationView = useCallback((patientId: string) => {
    auditLog.conversationView(patientId)
  }, [])

  const logMessageSend = useCallback((patientId: string) => {
    auditLog.messageSend(patientId)
  }, [])

  const logDocumentView = useCallback((documentId: string, documentType: string) => {
    auditLog.documentView(documentId, documentType)
  }, [])

  const logDocumentDownload = useCallback((documentId: string, documentType: string) => {
    auditLog.documentDownload(documentId, documentType)
  }, [])

  const logCheckinView = useCallback((checkinId: string, patientId: string) => {
    auditLog.checkinView(checkinId, patientId)
  }, [])

  const logCustom = useCallback(
    (
      action: AuditAction,
      resourceType: AuditResourceType,
      resourceId: string | null,
      options?: Parameters<typeof auditLog.custom>[3]
    ) => {
      auditLog.custom(action, resourceType, resourceId, options)
    },
    []
  )

  return {
    logPatientView,
    logPatientListView,
    logPatientSearch,
    logConversationView,
    logMessageSend,
    logDocumentView,
    logDocumentDownload,
    logCheckinView,
    logCustom,
    // Direct access to the service for advanced use cases
    auditLog,
  }
}
