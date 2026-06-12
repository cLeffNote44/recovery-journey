import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp, mockPrisma, makePatient, signTestToken } from '../test/setup.js'
import type { FastifyInstance } from 'fastify'

describe('Patient Sync Routes', () => {
  let app: FastifyInstance
  let patientToken: string

  beforeAll(async () => {
    app = await buildApp()
    patientToken = signTestToken(app, {
      id: 'patient-1',
      type: 'patient',
      facilityId: 'facility-1',
      deviceId: 'device-1',
    })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const authHeaders = () => ({ authorization: `Bearer ${patientToken}` })

  // ─── Single Check-in ──────────────────────────────────────────────────────

  describe('POST /api/v1/sync/check-in', () => {
    it('creates a check-in', async () => {
      mockPrisma.checkIn.create.mockResolvedValue({ id: 'ci-1', mood: 7 })
      mockPrisma.patient.findUnique.mockResolvedValue(makePatient())

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-in',
        headers: authHeaders(),
        payload: {
          date: '2025-01-15T10:00:00.000Z',
          mood: 7,
          notes: 'Feeling good',
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().success).toBe(true)
      expect(mockPrisma.checkIn.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: 'patient-1',
            mood: 7,
          }),
        })
      )
    })

    it('notifies counselor of concerning check-in', async () => {
      const { broadcastToUser } = await import('../websocket/handler.js')
      mockPrisma.checkIn.create.mockResolvedValue({ id: 'ci-1', mood: 2, date: new Date() })
      mockPrisma.patient.findUnique.mockResolvedValue(makePatient())

      await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-in',
        headers: authHeaders(),
        payload: { date: '2025-01-15T10:00:00.000Z', mood: 2 },
      })

      expect(broadcastToUser).toHaveBeenCalledWith(
        'staff:staff-1',
        expect.objectContaining({
          type: 'patient.checkin',
          data: expect.objectContaining({ isConcerning: true }),
        })
      )
    })

    it('rejects without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-in',
        payload: { date: '2025-01-15T10:00:00.000Z', mood: 7 },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects invalid mood value', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-in',
        headers: authHeaders(),
        payload: { date: '2025-01-15T10:00:00.000Z', mood: 15 },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── Single Craving ───────────────────────────────────────────────────────

  describe('POST /api/v1/sync/craving', () => {
    it('creates a craving entry', async () => {
      mockPrisma.craving.create.mockResolvedValue({ id: 'cr-1', intensity: 5 })
      mockPrisma.patient.findUnique.mockResolvedValue(makePatient())

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/craving',
        headers: authHeaders(),
        payload: {
          date: '2025-01-15T14:00:00.000Z',
          intensity: 5,
          trigger: 'stress',
          overcame: true,
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().success).toBe(true)
    })

    it('alerts counselor on high-intensity craving', async () => {
      const { broadcastToUser } = await import('../websocket/handler.js')
      mockPrisma.craving.create.mockResolvedValue({ id: 'cr-1', intensity: 9, date: new Date() })
      mockPrisma.patient.findUnique.mockResolvedValue(makePatient())

      await app.inject({
        method: 'POST',
        url: '/api/v1/sync/craving',
        headers: authHeaders(),
        payload: {
          date: '2025-01-15T14:00:00.000Z',
          intensity: 9,
          trigger: 'social pressure',
          overcame: false,
        },
      })

      expect(broadcastToUser).toHaveBeenCalledWith(
        'staff:staff-1',
        expect.objectContaining({
          type: 'patient.alert',
          data: expect.objectContaining({ severity: 'critical' }),
        })
      )
    })
  })

  // ─── Plural Check-ins (new endpoint) ──────────────────────────────────────

  describe('POST /api/v1/sync/check-ins', () => {
    it('syncs multiple check-ins', async () => {
      mockPrisma.checkIn.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-ins',
        headers: authHeaders(),
        payload: {
          checkIns: [
            { date: '2025-01-15T10:00:00.000Z', mood: 7 },
            { date: '2025-01-16T10:00:00.000Z', mood: 8, notes: 'Great day' },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(2)
      expect(mockPrisma.checkIn.create).toHaveBeenCalledTimes(2)
    })

    it('returns partial count on some failures', async () => {
      mockPrisma.checkIn.create
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('duplicate'))

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-ins',
        headers: authHeaders(),
        payload: {
          checkIns: [
            { date: '2025-01-15T10:00:00.000Z', mood: 7 },
            { date: '2025-01-15T10:00:00.000Z', mood: 7 }, // duplicate
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(1)
    })

    it('returns 0 for empty array', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/check-ins',
        headers: authHeaders(),
        payload: { checkIns: [] },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(0)
    })
  })

  // ─── Plural Cravings (new endpoint) ───────────────────────────────────────

  describe('POST /api/v1/sync/cravings', () => {
    it('syncs multiple cravings', async () => {
      mockPrisma.craving.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/cravings',
        headers: authHeaders(),
        payload: {
          cravings: [
            { date: '2025-01-15T14:00:00.000Z', intensity: 3, overcame: true },
            { date: '2025-01-16T20:00:00.000Z', intensity: 6, trigger: 'loneliness', overcame: true },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(2)
    })
  })

  // ─── Plural Goals (new endpoint) ──────────────────────────────────────────

  describe('POST /api/v1/sync/goals', () => {
    it('syncs goals with uppercase enums', async () => {
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.patientGoal.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/goals',
        headers: authHeaders(),
        payload: {
          goals: [
            {
              recoverGoalId: 'goal-1',
              title: 'Attend meetings',
              category: 'RECOVERY',
              targetType: 'STREAK',
              currentValue: 5,
              frequency: 'WEEKLY',
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(1)
    })

    it('normalizes lowercase enums from Recover app', async () => {
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.patientGoal.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/goals',
        headers: authHeaders(),
        payload: {
          goals: [
            {
              recoverGoalId: 42, // number ID — should be coerced to string
              title: 'Daily meditation',
              category: 'wellness', // lowercase
              targetType: 'yes-no', // lowercase with hyphen
              currentValue: 1,
              frequency: 'daily', // lowercase
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(1)
      expect(mockPrisma.patientGoal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recoverGoalId: '42',
            category: 'WELLNESS',
            targetType: 'YES_NO',
            frequency: 'DAILY',
          }),
        })
      )
    })

    it('scopes goal updates to the authenticated patient', async () => {
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 1 })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/goals',
        headers: authHeaders(),
        payload: {
          goals: [
            {
              recoverGoalId: 'goal-1',
              title: 'Attend meetings',
              category: 'RECOVERY',
              targetType: 'STREAK',
              currentValue: 6,
              frequency: 'WEEKLY',
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(1)
      expect(mockPrisma.patientGoal.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { recoverGoalId: 'goal-1', patientId: 'patient-1' },
        })
      )
      expect(mockPrisma.patientGoal.create).not.toHaveBeenCalled()
    })

    it('refuses to overwrite a goal owned by another patient', async () => {
      const { Prisma } = await import('@prisma/client')
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.patientGoal.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/goals',
        headers: authHeaders(),
        payload: {
          goals: [
            {
              recoverGoalId: 'someone-elses-goal',
              title: 'Hijacked goal',
              category: 'RECOVERY',
              targetType: 'STREAK',
              currentValue: 0,
              frequency: 'DAILY',
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(0)
    })

    it('accepts optional progress array', async () => {
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.patientGoal.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/goals',
        headers: authHeaders(),
        payload: {
          goals: [
            {
              recoverGoalId: 'g-1',
              title: 'Exercise',
              category: 'wellness',
              targetType: 'numerical',
              targetValue: 30,
              currentValue: 15,
              frequency: 'daily',
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
          progress: [
            { goalId: 'g-1', date: '2025-01-15T00:00:00.000Z', value: 15 },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().syncedCount).toBe(1)
    })
  })

  // ─── Batch Sync ───────────────────────────────────────────────────────────

  describe('POST /api/v1/sync/batch', () => {
    it('syncs mixed data types', async () => {
      mockPrisma.checkIn.create.mockResolvedValue({})
      mockPrisma.craving.create.mockResolvedValue({})
      mockPrisma.patientGoal.updateMany.mockResolvedValue({ count: 0 })
      mockPrisma.patientGoal.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/batch',
        headers: authHeaders(),
        payload: {
          checkIns: [{ date: '2025-01-15T10:00:00.000Z', mood: 7 }],
          cravings: [{ date: '2025-01-15T14:00:00.000Z', intensity: 4, overcame: true }],
          goals: [
            {
              recoverGoalId: 'g-1',
              title: 'Stay sober',
              category: 'RECOVERY',
              targetType: 'STREAK',
              currentValue: 30,
              frequency: 'DAILY',
              startDate: '2025-01-01T00:00:00.000Z',
              isActive: true,
              isCompleted: false,
            },
          ],
        },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.results.checkIns.created).toBe(1)
      expect(body.results.cravings.created).toBe(1)
      expect(body.results.goals.synced).toBe(1)
    })

    it('handles empty batch', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/batch',
        headers: authHeaders(),
        payload: {},
      })

      expect(res.statusCode).toBe(200)
    })
  })

  // ─── Treatment Plan ───────────────────────────────────────────────────────

  describe('GET /api/v1/sync/treatment-plan', () => {
    it('returns treatment plan with phases', async () => {
      mockPrisma.treatmentAssignment.findUnique.mockResolvedValue({
        currentPhaseIndex: 1,
        startDate: new Date('2025-01-01'),
        treatmentPlan: {
          id: 'tp-1',
          name: 'Recovery Plan A',
          description: 'Standard 90-day program',
          phases: [
            {
              id: 'phase-1',
              name: 'Phase 1',
              description: 'Stabilization',
              duration: 30,
              durationUnit: 'DAYS',
              goals: ['Attend daily meetings'],
              activities: ['Group therapy'],
            },
          ],
        },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/treatment-plan',
        headers: authHeaders(),
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.treatmentPlan.name).toBe('Recovery Plan A')
      expect(body.treatmentPlan.phases).toHaveLength(1)
    })

    it('returns null when no plan assigned', async () => {
      mockPrisma.treatmentAssignment.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/treatment-plan',
        headers: authHeaders(),
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().treatmentPlan).toBeNull()
    })
  })

  // ─── Profile ──────────────────────────────────────────────────────────────

  describe('GET /api/v1/sync/profile', () => {
    it('returns patient profile with days sober and streak', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(makePatient())
      mockPrisma.checkIn.findMany.mockResolvedValue([
        { date: new Date() },
        { date: new Date(Date.now() - 86400000) },
      ])

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/profile',
        headers: authHeaders(),
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.profile.firstName).toBe('John')
      expect(body.profile.daysSober).toBeGreaterThan(0)
      expect(body.profile.checkInStreak).toBeGreaterThanOrEqual(0)
      expect(body.profile.counselor.name).toBe('Jane Doe')
    })

    it('returns 404 for unknown patient', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/profile',
        headers: authHeaders(),
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── Auth Enforcement ─────────────────────────────────────────────────────

  describe('Auth enforcement', () => {
    it('rejects staff token on patient-only routes', async () => {
      const staffToken = signTestToken(app, {
        id: 'staff-1',
        email: 'staff@test.com',
        role: 'COUNSELOR',
        facilityId: 'facility-1',
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/profile',
        headers: { authorization: `Bearer ${staffToken}` },
      })

      expect(res.statusCode).toBe(403)
    })
  })
})
