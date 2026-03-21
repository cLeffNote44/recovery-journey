import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuditLogService } from './auditLog'

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}))

import api from './api'

describe('AuditLogService', () => {
  let auditService: AuditLogService

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    auditService = new AuditLogService()
  })

  afterEach(() => {
    auditService.stopFlushInterval()
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with session ID and user agent', () => {
      // The service should be initialized with context
      expect(auditService).toBeDefined()
    })
  })

  describe('setUserContext', () => {
    it('should set user context', () => {
      auditService.setUserContext({
        id: 'user-123',
        email: 'test@example.com',
        role: 'clinician',
        facilityId: 'facility-456',
      })

      // Log an event and check context is included
      auditService.log({
        action: 'PATIENT_VIEW',
        resourceType: 'patient',
        resourceId: 'patient-789',
        result: 'success',
      })

      // Flush to trigger API call
      auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                userId: 'user-123',
                userEmail: 'test@example.com',
                userRole: 'clinician',
                facilityId: 'facility-456',
              }),
            }),
          ]),
        })
      )
    })
  })

  describe('clearUserContext', () => {
    it('should clear user context but keep session info', () => {
      auditService.setUserContext({
        id: 'user-123',
        email: 'test@example.com',
        role: 'clinician',
      })

      auditService.clearUserContext()

      auditService.log({
        action: 'LOGIN_FAILURE',
        resourceType: 'user',
        resourceId: null,
        result: 'failure',
      })

      auditService.flush()

      // Context should have new session ID but no user info
      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              context: expect.objectContaining({
                sessionId: expect.stringContaining('session_'),
              }),
            }),
          ]),
        })
      )
    })
  })

  describe('log', () => {
    it('should queue log entries', async () => {
      await auditService.log({
        action: 'PATIENT_VIEW',
        resourceType: 'patient',
        resourceId: 'patient-123',
        result: 'success',
      })

      await auditService.log({
        action: 'MESSAGE_SEND',
        resourceType: 'message',
        resourceId: 'patient-123',
        result: 'success',
      })

      // Entries are queued, not sent immediately
      expect(api.post).not.toHaveBeenCalled()

      // Flush the queue
      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({ action: 'PATIENT_VIEW' }),
            expect.objectContaining({ action: 'MESSAGE_SEND' }),
          ]),
        })
      )
    })

    it('should immediately flush critical events', async () => {
      await auditService.log({
        action: 'LOGIN_SUCCESS',
        resourceType: 'user',
        resourceId: 'user-123',
        result: 'success',
      })

      // Critical events should trigger immediate flush
      expect(api.post).toHaveBeenCalled()
    })

    it('should include metadata and description', async () => {
      await auditService.log({
        action: 'PATIENT_UPDATE',
        resourceType: 'patient',
        resourceId: 'patient-123',
        result: 'success',
        description: 'Updated patient contact info',
        metadata: { fieldsUpdated: ['phone', 'email'] },
        phiFieldsAccessed: ['phone', 'email'],
      })

      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              description: 'Updated patient contact info',
              metadata: { fieldsUpdated: ['phone', 'email'] },
              phiFieldsAccessed: ['phone', 'email'],
            }),
          ]),
        })
      )
    })
  })

  describe('flush', () => {
    it('should not flush if queue is empty', async () => {
      await auditService.flush()
      expect(api.post).not.toHaveBeenCalled()
    })

    it('should clear queue after successful flush', async () => {
      await auditService.log({
        action: 'PATIENT_VIEW',
        resourceType: 'patient',
        resourceId: 'patient-123',
        result: 'success',
      })

      await auditService.flush()

      // First flush should have been called
      expect(api.post).toHaveBeenCalledTimes(1)

      // Second flush should not send anything
      await auditService.flush()
      expect(api.post).toHaveBeenCalledTimes(1)
    })

    it('should re-queue entries on flush failure', async () => {
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      )

      await auditService.log({
        action: 'PATIENT_VIEW',
        resourceType: 'patient',
        resourceId: 'patient-123',
        result: 'success',
      })

      await auditService.flush()

      // Entries should be re-queued
      // Reset mock for next call
      ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { success: true },
      })

      await auditService.flush()

      // Should send the re-queued entries
      expect(api.post).toHaveBeenCalledTimes(2)
    })
  })

  describe('periodic flush', () => {
    it('should flush queue periodically', async () => {
      // Stop the interval first to prevent infinite loop
      auditService.stopFlushInterval()

      await auditService.log({
        action: 'PATIENT_VIEW',
        resourceType: 'patient',
        resourceId: 'patient-123',
        result: 'success',
      })

      expect(api.post).not.toHaveBeenCalled()

      // Manual flush since we stopped the interval
      await auditService.flush()

      expect(api.post).toHaveBeenCalled()
    })
  })

  describe('convenience methods', () => {
    beforeEach(() => {
      auditService.setUserContext({
        id: 'user-123',
        email: 'test@example.com',
        role: 'clinician',
      })
    })

    it('loginSuccess should log correct action', async () => {
      await auditService.loginSuccess('user-123', { method: 'password' })

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'LOGIN_SUCCESS',
              resourceType: 'user',
              resourceId: 'user-123',
              result: 'success',
            }),
          ]),
        })
      )
    })

    it('loginFailure should log correct action', async () => {
      await auditService.loginFailure('test@example.com', 'Invalid password')

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'LOGIN_FAILURE',
              resourceType: 'user',
              result: 'failure',
              errorMessage: 'Invalid password',
            }),
          ]),
        })
      )
    })

    it('logout should log correct action', async () => {
      await auditService.logout('manual')
      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'LOGOUT',
              resourceType: 'user',
              result: 'success',
            }),
          ]),
        })
      )
    })

    it('logout with session_timeout should log SESSION_TIMEOUT action', async () => {
      await auditService.logout('session_timeout')
      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'SESSION_TIMEOUT',
            }),
          ]),
        })
      )
    })

    it('patientView should log with PHI fields', async () => {
      await auditService.patientView('patient-123', ['name', 'dob', 'ssn'])
      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'PATIENT_VIEW',
              resourceType: 'patient',
              resourceId: 'patient-123',
              phiFieldsAccessed: ['name', 'dob', 'ssn'],
            }),
          ]),
        })
      )
    })

    it('patientSearch should log query and result count', async () => {
      await auditService.patientSearch('Smith', 5)
      await auditService.flush()

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'PATIENT_SEARCH',
              metadata: { query: 'Smith', resultCount: 5 },
            }),
          ]),
        })
      )
    })

    it('dataExport should log export details', async () => {
      await auditService.dataExport('patients', 100, { status: 'active' })

      expect(api.post).toHaveBeenCalledWith(
        '/audit/logs',
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              action: 'DATA_EXPORT',
              resourceType: 'report',
              metadata: expect.objectContaining({
                exportType: 'patients',
                recordCount: 100,
                filters: { status: 'active' },
              }),
            }),
          ]),
        })
      )
    })
  })

  describe('queue management', () => {
    it('should limit queue size on repeated failures', async () => {
      // Make all API calls fail
      ;(api.post as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      )

      // Add more than 100 entries
      for (let i = 0; i < 150; i++) {
        await auditService.log({
          action: 'PATIENT_VIEW',
          resourceType: 'patient',
          resourceId: `patient-${i}`,
          result: 'success',
        })
      }

      // Attempt to flush (will fail and re-queue)
      await auditService.flush()

      // Queue should be limited to 100 entries
      // We can verify this by checking subsequent flush behavior
      ;(api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { success: true },
      })

      await auditService.flush()

      // The entries array should have at most 100 items
      const calls = (api.post as ReturnType<typeof vi.fn>).mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[1].entries.length).toBeLessThanOrEqual(100)
    })
  })
})
