import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { buildApp, mockPrisma, makeStaff, makeRegKey, makePatient } from '../test/setup.js'
import { createTotp } from '../lib/totp.js'
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

    it('rejects login when IP/identifier brute-force protection trips', async () => {
      const { checkBruteForce } = await import('../middleware/security.js')
      ;(checkBruteForce as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: Date.now() + 60_000,
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'whatever' },
      })

      expect(res.statusCode).toBe(401)
      // Must short-circuit before touching the database
      expect(mockPrisma.staff.findUnique).not.toHaveBeenCalled()
    })
  })

  // ─── Two-Factor Login ─────────────────────────────────────────────────────

  describe('POST /api/v1/auth/staff/login with 2FA', () => {
    const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'

    const make2faStaff = (overrides: Record<string, unknown> = {}) =>
      makeStaff({ twoFactorEnabled: true, twoFactorSecret: TOTP_SECRET, ...overrides })

    const currentCode = () =>
      createTotp('clinician@test.com', TOTP_SECRET).generate()

    it('returns a pending token instead of real tokens when 2FA is enabled', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff({ passwordHash: hash }))

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.requiresTwoFactor).toBe(true)
      expect(body.pendingToken).toBeDefined()
      expect(body.accessToken).toBeUndefined()
      expect(body.refreshToken).toBeUndefined()
    })

    it('exchanges pending token + valid code for real tokens', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff({ passwordHash: hash }))
      mockPrisma.staff.update.mockResolvedValue({})
      mockPrisma.refreshToken.create.mockResolvedValue({})

      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })
      const { pendingToken } = loginRes.json()

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login/2fa',
        payload: { pendingToken, code: currentCode() },
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.accessToken).toBeDefined()
      expect(body.refreshToken).toBeDefined()
      expect(body.user.email).toBe('clinician@test.com')
    })

    it('rejects an invalid 2FA code and increments failed attempts', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff({ passwordHash: hash }))
      mockPrisma.staff.update.mockResolvedValue({})

      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })
      const { pendingToken } = loginRes.json()

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login/2fa',
        payload: { pendingToken, code: '000000' },
      })

      expect(res.statusCode).toBe(401)
      expect(mockPrisma.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginAttempts: 1 }),
        })
      )
      expect(mockPrisma.refreshToken.create).not.toHaveBeenCalled()
    })

    it('throttles 2FA code attempts by ip + staff id', async () => {
      const { checkBruteForce } = await import('../middleware/security.js')
      ;(checkBruteForce as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: Date.now() + 60_000,
      })

      const pendingToken = app.jwt.sign({ id: 'staff-1', type: '2fa_pending' as const }, { expiresIn: '5m' })
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff())

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login/2fa',
        payload: { pendingToken, code: '000000' },
      })

      expect(res.statusCode).toBe(401)
      // Rate-limited before any TOTP validation / DB write
      expect(mockPrisma.staff.update).not.toHaveBeenCalled()
    })

    it('rejects a regular access token as pending token', async () => {
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff())

      // A full staff access token must not be usable as a 2FA session
      const staffToken = app.jwt.sign({
        id: 'staff-1',
        email: 'clinician@test.com',
        role: 'COUNSELOR',
        facilityId: 'facility-1',
        tokenVersion: 0,
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login/2fa',
        payload: { pendingToken: staffToken, code: currentCode() },
      })

      expect(res.statusCode).toBe(401)
    })

    it('pending token cannot authenticate regular requests', async () => {
      const hash = await bcrypt.hash('password123', 10)
      mockPrisma.staff.findUnique.mockResolvedValue(make2faStaff({ passwordHash: hash }))

      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/staff/login',
        payload: { email: 'clinician@test.com', password: 'password123' },
      })
      const { pendingToken } = loginRes.json()

      // Try using the pending token on an authenticated patient-sync route
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/sync/treatment-plan',
        headers: { authorization: `Bearer ${pendingToken}` },
      })

      expect(res.statusCode).toBeGreaterThanOrEqual(401)
      expect(res.statusCode).toBeLessThanOrEqual(403)
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
