import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { buildApp, mockPrisma, makeStaff, makeRegKey, makePatient } from '../test/setup.js'
import type { FastifyInstance } from 'fastify'

describe('Auth Routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Staff Login ──────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/staff/login', () => {
    it('returns tokens on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(makeStaff({ passwordHash: hash }))
      mockPrisma.staff.update.mockResolvedValue({})
      mockPrisma.refreshToken.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.success).toBe(true)
      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
      expect(body.user.email).toBe('clinician@test.com')
      expect(body.user.role).toBe('COUNSELOR')
    })

    it('rejects invalid email', async () => {
      mockPrisma.staff.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'nobody@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json().error).toBe('Invalid email or password')
    })

    it('rejects wrong password and increments failed attempts', async () => {
      const hash = await bcrypt.hash('correctpassword', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(makeStaff({ passwordHash: hash }))
      mockPrisma.staff.update.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'wrongpassword' },
      })

      expect(res.statusCode).toBe(401)
      expect(mockPrisma.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginAttempts: 1 }),
        })
      )
    })

    it('locks account after 5 failed attempts', async () => {
      const hash = await bcrypt.hash('correctpassword', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(
        makeStaff({ passwordHash: hash, failedLoginAttempts: 4 })
      )
      mockPrisma.staff.update.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'wrongpassword' },
      })

      expect(res.statusCode).toBe(401)
      expect(mockPrisma.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        })
      )
    })

    it('rejects locked account', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(
        makeStaff({ passwordHash: hash, lockedUntil: new Date(Date.now() + 60000) })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json().error).toContain('locked')
    })

    it('rejects inactive account', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(
        makeStaff({ passwordHash: hash, status: 'INACTIVE' })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json().error).toBe('Account is not active')
    })

    it('resets failed attempts on successful login', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(
        makeStaff({ passwordHash: hash, failedLoginAttempts: 3 })
      )
      mockPrisma.staff.update.mockResolvedValue({})
      mockPrisma.refreshToken.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(200)
      expect(mockPrisma.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        })
      )
    })

    it('returns 400 on missing fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'test@test.com' },
      })

      expect(res.statusCode).toBe(400)
    })

    it('returns 400 on invalid email format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'not-an-email', password: 'password123' },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── Patient Login ────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/patient/login', () => {
    it('returns tokens on valid registration key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(makeRegKey())
      mockPrisma.$transaction.mockResolvedValue([{}, {}])
      mockPrisma.patientDevice.upsert.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/patient/login',
        payload: {
          registrationKey: 'TESTKEY123',
          deviceId: 'device-1',
          platform: 'web',
        },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.success).toBe(true)
      expect(body.accessToken).toBeDefined()
      expect(body.deviceToken).toBeDefined()
      expect(body.patient.firstName).toBe('John')
    })

    it('rejects invalid registration key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/patient/login',
        payload: {
          registrationKey: 'BADKEY',
          deviceId: 'device-1',
          platform: 'web',
        },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects expired registration key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(
        makeRegKey({ expiresAt: new Date(Date.now() - 1000) })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/patient/login',
        payload: {
          registrationKey: 'TESTKEY123',
          deviceId: 'device-1',
          platform: 'web',
        },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json().error).toContain('expired')
    })

    it('rejects discharged patient', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(
        makeRegKey({ patient: makePatient({ status: 'DISCHARGED' }) })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/patient/login',
        payload: {
          registrationKey: 'TESTKEY123',
          deviceId: 'device-1',
          platform: 'web',
        },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects invalid platform', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/patient/login',
        payload: {
          registrationKey: 'TESTKEY123',
          deviceId: 'device-1',
          platform: 'gameboy',
        },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  // ─── Token Refresh ────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/refresh-token', () => {
    it('rotates tokens on valid refresh', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'valid-refresh-token',
        staffId: 'staff-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        staff: makeStaff(),
      })
      mockPrisma.refreshToken.update.mockResolvedValue({})
      mockPrisma.refreshToken.create.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh-token',
        payload: { refreshToken: 'valid-refresh-token' },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
      // Old token should be revoked
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        })
      )
    })

    it('rejects invalid refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh-token',
        payload: { refreshToken: 'bad-token' },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects expired refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'expired-token',
        staffId: 'staff-1',
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
        staff: makeStaff(),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh-token',
        payload: { refreshToken: 'expired-token' },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects already-revoked refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'revoked-token',
        staffId: 'staff-1',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(),
        staff: makeStaff(),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh-token',
        payload: { refreshToken: 'revoked-token' },
      })

      expect(res.statusCode).toBe(401)
    })

    it('rejects refresh for inactive staff', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'valid-token',
        staffId: 'staff-1',
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
        staff: makeStaff({ status: 'INACTIVE' }),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh-token',
        payload: { refreshToken: 'valid-token' },
      })

      expect(res.statusCode).toBe(401)
    })
  })

  // ─── Logout ───────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('revokes refresh token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        token: 'logout-token',
        staffId: 'staff-1',
        revokedAt: null,
      })
      mockPrisma.refreshToken.update.mockResolvedValue({})

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        payload: { refreshToken: 'logout-token' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().success).toBe(true)
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled()
    })

    it('succeeds gracefully for unknown token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        payload: { refreshToken: 'unknown-token' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().success).toBe(true)
    })
  })

  // ─── Validate Key ─────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/validate-key', () => {
    it('returns valid for unused key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(makeRegKey())

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/validate-key',
        payload: { registrationKey: 'TESTKEY123' },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.valid).toBe(true)
      expect(body.alreadyUsed).toBe(false)
      expect(body.facilityName).toBe('Test Facility')
    })

    it('returns invalid for unknown key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/validate-key',
        payload: { registrationKey: 'NOPE' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().valid).toBe(false)
    })

    it('flags expired key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(
        makeRegKey({ expiresAt: new Date(Date.now() - 1000) })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/validate-key',
        payload: { registrationKey: 'TESTKEY123' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().valid).toBe(false)
      expect(res.json().error).toContain('expired')
    })

    it('flags already-used key', async () => {
      mockPrisma.registrationKey.findUnique.mockResolvedValue(
        makeRegKey({ usedAt: new Date() })
      )

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/validate-key',
        payload: { registrationKey: 'TESTKEY123' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().alreadyUsed).toBe(true)
    })
  })
})
