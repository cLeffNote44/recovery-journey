import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { prisma } from '../lib/prisma.js'
import { ApiError } from '../lib/error-handler.js'
import { requireStaff } from '../middleware/auth.js'

const verifyCodeSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
})

const disableSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
  password: z.string().min(1),
})

export async function twoFactorRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireStaff)

  /**
   * POST /2fa/setup
   * Generate a TOTP secret and QR code for setup
   */
  fastify.post('/setup', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.staffUser!

    const staff = await prisma.staff.findUnique({
      where: { id: user.id },
      select: { email: true, twoFactorEnabled: true },
    })

    if (!staff) throw ApiError.notFound('User not found')
    if (staff.twoFactorEnabled) {
      throw ApiError.badRequest('Two-factor authentication is already enabled')
    }

    // Generate TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 })
    const totp = new OTPAuth.TOTP({
      issuer: 'Recovery Journey',
      label: staff.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    })

    // Store secret (not yet enabled — user must verify first)
    await prisma.staff.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    })

    // Generate QR code as data URL
    const otpauthUrl = totp.toString()
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    return {
      success: true,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    }
  })

  /**
   * POST /2fa/verify
   * Verify a TOTP code and enable 2FA
   */
  fastify.post('/verify', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.staffUser!
    const body = verifyCodeSchema.parse(request.body)

    const staff = await prisma.staff.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true, email: true },
    })

    if (!staff) throw ApiError.notFound('User not found')
    if (staff.twoFactorEnabled) {
      throw ApiError.badRequest('Two-factor authentication is already enabled')
    }
    if (!staff.twoFactorSecret) {
      throw ApiError.badRequest('Call /2fa/setup first to generate a secret')
    }

    // Verify the code
    const totp = new OTPAuth.TOTP({
      issuer: 'Recovery Journey',
      label: staff.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(staff.twoFactorSecret),
    })

    const delta = totp.validate({ token: body.code, window: 1 })

    if (delta === null) {
      throw ApiError.badRequest('Invalid verification code. Please try again.')
    }

    // Enable 2FA
    await prisma.staff.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    })

    return { success: true }
  })

  /**
   * POST /2fa/validate
   * Validate a TOTP code during login (called after password auth)
   */
  fastify.post('/validate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.staffUser!
    const body = verifyCodeSchema.parse(request.body)

    const staff = await prisma.staff.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true, email: true },
    })

    if (!staff) throw ApiError.notFound('User not found')
    if (!staff.twoFactorEnabled || !staff.twoFactorSecret) {
      throw ApiError.badRequest('Two-factor authentication is not enabled')
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'Recovery Journey',
      label: staff.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(staff.twoFactorSecret),
    })

    const delta = totp.validate({ token: body.code, window: 1 })

    if (delta === null) {
      throw ApiError.unauthorized('Invalid two-factor code')
    }

    return { success: true, valid: true }
  })

  /**
   * POST /2fa/disable
   * Disable 2FA (requires current code and password)
   */
  fastify.post('/disable', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.staffUser!
    const body = disableSchema.parse(request.body)

    const staff = await prisma.staff.findUnique({
      where: { id: user.id },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
        email: true,
        passwordHash: true,
      },
    })

    if (!staff) throw ApiError.notFound('User not found')
    if (!staff.twoFactorEnabled || !staff.twoFactorSecret) {
      throw ApiError.badRequest('Two-factor authentication is not enabled')
    }

    // Verify password
    const bcrypt = await import('bcryptjs')
    const validPassword = await bcrypt.compare(body.password, staff.passwordHash)
    if (!validPassword) {
      throw ApiError.unauthorized('Invalid password')
    }

    // Verify TOTP code
    const totp = new OTPAuth.TOTP({
      issuer: 'Recovery Journey',
      label: staff.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(staff.twoFactorSecret),
    })

    const delta = totp.validate({ token: body.code, window: 1 })
    if (delta === null) {
      throw ApiError.badRequest('Invalid two-factor code')
    }

    // Disable 2FA
    await prisma.staff.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return { success: true }
  })

  /**
   * GET /2fa/status
   * Check if 2FA is enabled for the current user
   */
  fastify.get('/status', async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.staffUser!

    const staff = await prisma.staff.findUnique({
      where: { id: user.id },
      select: { twoFactorEnabled: true },
    })

    return {
      success: true,
      enabled: staff?.twoFactorEnabled ?? false,
    }
  })
}
