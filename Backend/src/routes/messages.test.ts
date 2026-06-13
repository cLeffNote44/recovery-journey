import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp, mockPrisma, makePatient, signTestToken } from '../test/setup.js'
import { broadcastToUser } from '../websocket/handler.js'
import type { FastifyInstance } from 'fastify'

const mockBroadcast = broadcastToUser as unknown as ReturnType<typeof vi.fn>

describe('Messages — patient crisis escalation', () => {
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
    mockPrisma.patient.findUnique.mockResolvedValue({
      assignedCounselorId: 'staff-1',
      firstName: 'John',
      lastName: 'Smith',
    })
    mockPrisma.message.create.mockResolvedValue({
      id: 'msg-1',
      patientId: 'patient-1',
      staffId: 'staff-1',
      senderType: 'PATIENT',
      content: 'I need help now',
      priority: 'URGENT',
      sentAt: new Date('2026-01-15T10:00:00.000Z'),
    })
  })

  const authHeaders = () => ({ authorization: `Bearer ${patientToken}` })

  it('fires patient.alert to the counselor on an URGENT message', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/messages/patient/send',
      headers: authHeaders(),
      payload: { content: 'I need help now', priority: 'URGENT' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().success).toBe(true)

    // Always delivers the message itself…
    expect(mockBroadcast).toHaveBeenCalledWith(
      'staff:staff-1',
      expect.objectContaining({ type: 'message.new' })
    )
    // …and additionally raises the crisis alert.
    expect(mockBroadcast).toHaveBeenCalledWith(
      'staff:staff-1',
      expect.objectContaining({
        type: 'patient.alert',
        data: expect.objectContaining({
          patientId: 'patient-1',
          patientName: 'John Smith',
          alertType: 'sos',
          severity: 'critical',
        }),
      })
    )
  })

  it('does NOT fire patient.alert for a normal-priority message', async () => {
    mockPrisma.message.create.mockResolvedValue({
      id: 'msg-2',
      content: 'just checking in',
      sentAt: new Date(),
      priority: 'NORMAL',
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/messages/patient/send',
      headers: authHeaders(),
      payload: { content: 'just checking in' },
    })

    expect(res.statusCode).toBe(200)
    const alertCalls = mockBroadcast.mock.calls.filter(
      ([, payload]) => payload?.type === 'patient.alert'
    )
    expect(alertCalls).toHaveLength(0)
  })

  it('rejects when the patient has no assigned counselor', async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      assignedCounselorId: null,
      firstName: 'John',
      lastName: 'Smith',
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/messages/patient/send',
      headers: authHeaders(),
      payload: { content: 'I need help now', priority: 'URGENT' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('requires authentication', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/messages/patient/send',
      payload: { content: 'hi' },
    })
    expect(res.statusCode).toBe(401)
    // makePatient kept importable for parity with other suites
    void makePatient
  })
})
