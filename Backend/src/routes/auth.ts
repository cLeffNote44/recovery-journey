import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { StaffRole } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { AuditLogger } from '../lib/audit-log.js'
import { validateTotpCode } from '../lib/totp.js'
import type { JwtPayload } from '../middleware/auth.js'
import { config } from '../config/env.js'

// Validation schemas
const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const patientLoginSchema = z.object({
  registrationKey: z.string().min(1),
  deviceId: z.string().min(1),
  deviceName: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web'])
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
})

const twoFactorLoginSchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().length(6).regex(/^\d+$/)
})

// Token expiry calculation
function getExpiryMs(duration: string): number {
  const match = duration.match(/^(\d+)([hdwmy])$/)
  if (!match) return 3600000 // default 1 hour

  const value = parseInt(match[1]!, 10)
  const unit = match[2]

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    case 'w': return value * 7 * 24 * 60 * 60 * 1000
    case 'm': return value * 30 * 24 * 60 * 60 * 1000
    case 'y': return value * 365 * 24 * 60 * 60 * 1000
    default: return 3600000
  }
}

interface StaffForTokens {
  id: string
  email: string
  role: StaffRole
  firstName: string
  lastName: string
  facilityId: string | null
  facility: { name: string } | null
}

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * Issue access + refresh tokens for a fully authenticated staff member.
   * Shared by password-only login and the 2FA exchange endpoint.
   */
  async function issueStaffTokens(staff: StaffForTokens) {
    const accessToken = fastify.jwt.sign({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      facilityId: staff.facilityId
    })

    const refreshToken = nanoid(64)
    const refreshExpiresAt = new Date(Date.now() + getExpiryMs(config.JWT_REFRESH_EXPIRES_IN))

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        staffId: staff.id,
        expiresAt: refreshExpiresAt
      }
    })

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn: getExpiryMs(config.JWT_EXPIRES_IN),
      user: {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        facilityId: staff.facilityId,
        facilityName: staff.facility?.name
      }
    }
  }

  /**
   * POST /auth/staff/login
   * Staff login with email/password
   */
  fastify.post('/staff/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = staffLoginSchema.parse(request.body)
    const audit = AuditLogger.fromRequest(request)

    // Find staff by email
    const staff = await prisma.staff.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { facility: true }
    })

    if (!staff) {
      await audit.loginFailed(body.email, 'User not found')
      throw ApiError.unauthorized('Invalid email or password')
    }

    // Check if account is locked
    if (staff.lockedUntil && staff.lockedUntil > new Date()) {
      await audit.loginFailed(body.email, 'Account locked')
      throw ApiError.unauthorized('Account is temporarily locked. Please try again later.')
    }

    // Check if account is active
    if (staff.status !== 'ACTIVE') {
      await audit.loginFailed(body.email, 'Account inactive')
      throw ApiError.unauthorized('Account is not active')
    }

    // Verify password
    const validPassword = await bcrypt.compare(body.password, staff.passwordHash)

    if (!validPassword) {
      // Increment failed attempts
      const failedAttempts = staff.failedLoginAttempts + 1
      const lockedUntil = failedAttempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
        : null

      await prisma.staff.update({
        where: { id: staff.id },
        data: { failedLoginAttempts: failedAttempts, lockedUntil }
      })

      await audit.loginFailed(body.email, 'Invalid password')
      throw ApiError.unauthorized('Invalid email or password')
    }

    // If 2FA is enabled, a correct password is not a complete login.
    // Issue a short-lived pending token that can only be exchanged for real
    // tokens at /staff/login/2fa with a valid TOTP code. Failed-attempt
    // counters are intentionally NOT reset here — otherwise an attacker with
    // the password could reset the lockout by restarting the login flow.
    if (staff.twoFactorEnabled && staff.twoFactorSecret) {
      const pendingToken = fastify.jwt.sign(
        { id: staff.id, type: '2fa_pending' as const },
        { expiresIn: '5m' }
      )
      return { success: true, requiresTwoFactor: true, pendingToken }
    }

    // Reset failed attempts on successful login
    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    // Audit log
    const auditWithUser = AuditLogger.fromRequest(request, staff.id)
    await auditWithUser.loginSuccess(staff.id)

    return issueStaffTokens(staff)
  })

  /**
   * POST /auth/staff/login/2fa
   * Exchange a 2FA pending token + TOTP code for real tokens
   */
  fastify.post('/staff/login/2fa', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = twoFactorLoginSchema.parse(request.body)
    const audit = AuditLogger.fromRequest(request)

    let decoded: JwtPayload
    try {
      decoded = fastify.jwt.verify<JwtPayload>(body.pendingToken)
    } catch {
      throw ApiError.unauthorized('Two-factor session expired. Please log in again.')
    }

    if (!('type' in decoded) || decoded.type !== '2fa_pending') {
      throw ApiError.unauthorized('Invalid two-factor session')
    }

    const staff = await prisma.staff.findUnique({
      where: { id: decoded.id },
      include: { facility: true }
    })

    if (!staff || staff.status !== 'ACTIVE' || !staff.twoFactorEnabled || !staff.twoFactorSecret) {
      throw ApiError.unauthorized('Invalid two-factor session')
    }

    if (staff.lockedUntil && staff.lockedUntil > new Date()) {
      await audit.loginFailed(staff.email, 'Account locked')
      throw ApiError.unauthorized('Account is temporarily locked. Please try again later.')
    }

    if (!validateTotpCode(staff.email, staff.twoFactorSecret, body.code)) {
      // Failed 2FA codes count toward the same lockout as bad passwords
      const failedAttempts = staff.failedLoginAttempts + 1
      const lockedUntil = failedAttempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null

      await prisma.staff.update({
        where: { id: staff.id },
        data: { failedLoginAttempts: failedAttempts, lockedUntil }
      })

      await audit.loginFailed(staff.email, 'Invalid 2FA code')
      throw ApiError.unauthorized('Invalid two-factor code')
    }

    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    const auditWithUser = AuditLogger.fromRequest(request, staff.id)
    await auditWithUser.loginSuccess(staff.id)

    return issueStaffTokens(staff)
  })

  /**
   * POST /auth/patient/login
   * Patient login with registration key (for Recover app)
   */
  fastify.post('/patient/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = patientLoginSchema.parse(request.body)

    // Find registration key
    const regKey = await prisma.registrationKey.findUnique({
      where: { key: body.registrationKey },
      include: {
        patient: {
          include: {
            facility: true,
            assignedCounselor: true
          }
        }
      }
    })

    if (!regKey) {
      throw ApiError.unauthorized('Invalid registration key')
    }

    // Check if key is expired
    if (regKey.expiresAt < new Date()) {
      throw ApiError.unauthorized('Registration key has expired. Please contact your facility for a new key.')
    }

    // Check if patient is active
    if (regKey.patient.status !== 'ACTIVE' && regKey.patient.status !== 'PENDING') {
      throw ApiError.unauthorized('Patient account is not active')
    }

    // Mark key as used and update patient status
    const now = new Date()
    await prisma.$transaction([
      prisma.registrationKey.update({
        where: { id: regKey.id },
        data: { usedAt: now }
      }),
      prisma.patient.update({
        where: { id: regKey.patientId },
        data: { status: 'ACTIVE' }
      })
    ])

    // Create or update device binding
    const deviceToken = nanoid(64)
    const deviceTokenHash = await bcrypt.hash(deviceToken, 10)

    await prisma.patientDevice.upsert({
      where: {
        patientId_deviceId: {
          patientId: regKey.patientId,
          deviceId: body.deviceId
        }
      },
      create: {
        patientId: regKey.patientId,
        deviceId: body.deviceId,
        deviceName: body.deviceName,
        platform: body.platform,
        tokenHash: deviceTokenHash,
        lastActiveAt: now
      },
      update: {
        deviceName: body.deviceName,
        platform: body.platform,
        tokenHash: deviceTokenHash,
        lastActiveAt: now,
        isActive: true
      }
    })

    // Generate access token for patient
    const accessToken = fastify.jwt.sign({
      id: regKey.patientId,
      type: 'patient',
      facilityId: regKey.patient.facilityId,
      deviceId: body.deviceId
    })

    return {
      success: true,
      accessToken,
      deviceToken, // Patient stores this for future auth
      patient: {
        id: regKey.patient.id,
        firstName: regKey.patient.firstName,
        lastName: regKey.patient.lastName,
        sobrietyDate: regKey.patient.sobrietyDate,
        facilityName: regKey.patient.facility.name,
        counselorName: regKey.patient.assignedCounselor
          ? `${regKey.patient.assignedCounselor.firstName} ${regKey.patient.assignedCounselor.lastName}`
          : null
      }
    }
  })

  /**
   * POST /auth/refresh-token
   * Refresh access token using refresh token
   */
  fastify.post('/refresh-token', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = refreshTokenSchema.parse(request.body)

    // Find refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: body.refreshToken },
      include: { staff: true }
    })

    if (!tokenRecord) {
      throw ApiError.unauthorized('Invalid refresh token')
    }

    // Check if token is expired or revoked
    if (tokenRecord.expiresAt < new Date() || tokenRecord.revokedAt) {
      throw ApiError.unauthorized('Refresh token expired or revoked')
    }

    // Check if staff is still active
    if (tokenRecord.staff.status !== 'ACTIVE') {
      throw ApiError.unauthorized('Account is not active')
    }

    // Revoke old refresh token (token rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    })

    // Generate new tokens
    const accessToken = fastify.jwt.sign({
      id: tokenRecord.staff.id,
      email: tokenRecord.staff.email,
      role: tokenRecord.staff.role,
      facilityId: tokenRecord.staff.facilityId
    })

    const newRefreshToken = nanoid(64)
    const refreshExpiresAt = new Date(Date.now() + getExpiryMs(config.JWT_REFRESH_EXPIRES_IN))

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        staffId: tokenRecord.staffId,
        expiresAt: refreshExpiresAt
      }
    })

    // Audit log
    const audit = AuditLogger.fromRequest(request, tokenRecord.staffId)
    await audit.log({
      action: 'TOKEN_REFRESH',
      resourceType: 'staff',
      resourceId: tokenRecord.staffId,
      description: 'Token refreshed'
    })

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: getExpiryMs(config.JWT_EXPIRES_IN)
    }
  })

  /**
   * POST /auth/logout
   * Logout and revoke refresh token
   */
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = refreshTokenSchema.parse(request.body)

    // Find and revoke refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: body.refreshToken }
    })

    if (tokenRecord && !tokenRecord.revokedAt) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() }
      })

      // Audit log
      const audit = AuditLogger.fromRequest(request, tokenRecord.staffId)
      await audit.logout(tokenRecord.staffId)
    }

    return { success: true }
  })

  /**
   * POST /auth/validate-key
   * Validate a registration key (for Recover app to check before prompting login)
   */
  fastify.post('/validate-key', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = z.object({ registrationKey: z.string() }).parse(request.body)

    const regKey = await prisma.registrationKey.findUnique({
      where: { key: body.registrationKey },
      include: {
        patient: {
          include: { facility: true }
        }
      }
    })

    if (!regKey) {
      return { valid: false, error: 'Invalid registration key' }
    }

    if (regKey.expiresAt < new Date()) {
      return { valid: false, error: 'Registration key has expired' }
    }

    if (regKey.usedAt) {
      return {
        valid: true,
        alreadyUsed: true,
        facilityName: regKey.patient.facility.name
      }
    }

    return {
      valid: true,
      alreadyUsed: false,
      facilityName: regKey.patient.facility.name,
      patientFirstName: regKey.patient.firstName
    }
  })
}
