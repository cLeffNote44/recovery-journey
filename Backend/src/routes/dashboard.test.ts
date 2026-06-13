import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp, mockPrisma, signTestToken } from '../test/setup.js'
import type { FastifyInstance } from 'fastify'

describe('Dashboard alerts — SOS surfacing', () => {
  let app: FastifyInstance
  let staffToken: string

  beforeAll(async () => {
    app = await buildApp()
    staffToken = signTestToken(app, {
      id: 'staff-1',
      email: 'counselor@test.com',
      role: 'COUNSELOR',
      facilityId: 'facility-1',
      tokenVersion: 0,
    })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // requireStaff re-check.
    mockPrisma.staff.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      role: 'COUNSELOR',
      facilityId: 'facility-1',
      tokenVersion: 0,
    })
    mockPrisma.craving.findMany.mockResolvedValue([])
    mockPrisma.checkIn.findMany.mockResolvedValue([])
    mockPrisma.message.findMany.mockResolvedValue([])
  })

  it('includes patient-initiated SOS (urgent) messages as critical alerts', async () => {
    mockPrisma.message.findMany.mockResolvedValue([
      {
        id: 'msg-1',
        content: 'I am struggling and need to talk now',
        sentAt: new Date('2026-01-15T10:00:00.000Z'),
        patient: { id: 'patient-1', firstName: 'John', lastName: 'Smith' },
      },
    ])

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/alerts',
      headers: { authorization: `Bearer ${staffToken}` },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.success).toBe(true)
    const sos = body.alerts.find((a: { type: string }) => a.type === 'sos')
    expect(sos).toMatchObject({
      id: 'sos-msg-1',
      severity: 'critical',
      patientId: 'patient-1',
      patientName: 'John Smith',
    })

    // The urgent-message query is scoped to PATIENT/URGENT/last-48h.
    expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ senderType: 'PATIENT', priority: 'URGENT' }),
      })
    )
  })

  it('returns no SOS alerts when there are no urgent messages', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/alerts',
      headers: { authorization: `Bearer ${staffToken}` },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.alerts.some((a: { type: string }) => a.type === 'sos')).toBe(false)
  })
})
