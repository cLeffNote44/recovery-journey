/**
 * Security Middleware
 *
 * Implements comprehensive security controls:
 * - Rate limiting (per IP and per user)
 * - Brute force protection
 * - Request validation
 * - Security headers
 * - IP blocking
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { logSecurityEvent, AuditEventType } from '../lib/audit.js'

// In-memory stores (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const loginAttemptStore = new Map<string, { attempts: number; lockedUntil: number | null }>()
const blockedIPs = new Set<string>()

// Configuration
const config = {
  // General rate limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX'] || '100')
  },
  // Strict rate limit for sensitive endpoints
  strictRateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 10
  },
  // Login brute force protection
  bruteForce: {
    maxAttempts: parseInt(process.env['MAX_LOGIN_ATTEMPTS'] || '5'),
    lockoutDuration: parseInt(process.env['LOCKOUT_DURATION_MINUTES'] || '15') * 60 * 1000
  },
  // Request size limits
  bodyLimit: 1024 * 1024, // 1MB
  // Suspicious patterns
  suspiciousPatterns: [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /<script[^>]*>[\s\S]*?<\/script>/gi, // XSS
    /javascript:/gi, // XSS
    /on\w+\s*=/gi, // Event handlers
    /\.\.\//g, // Path traversal
    /\0/g // Null bytes
  ]
}

/**
 * Get client IP address from request
 */
function getClientIP(request: FastifyRequest): string {
  const forwardedFor = request.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string') {
    const firstIP = forwardedFor.split(',')[0]
    return firstIP?.trim() || request.ip || 'unknown'
  }
  return request.ip || 'unknown'
}

/**
 * General rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const ip = getClientIP(request)
  const key = `rate:${ip}`
  const now = Date.now()

  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    await logSecurityEvent(AuditEventType.ACCESS_DENIED, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
      details: { reason: 'IP blocked', path: request.url }
    })

    reply.status(403).send({
      error: 'Forbidden',
      message: 'Access denied'
    })
    return
  }

  // Get or initialize rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.rateLimit.windowMs }
    rateLimitStore.set(key, entry)
  }

  entry.count++

  // Set rate limit headers
  reply.header('X-RateLimit-Limit', config.rateLimit.maxRequests)
  reply.header('X-RateLimit-Remaining', Math.max(0, config.rateLimit.maxRequests - entry.count))
  reply.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000))

  if (entry.count > config.rateLimit.maxRequests) {
    await logSecurityEvent(AuditEventType.RATE_LIMIT_EXCEEDED, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
      details: {
        path: request.url,
        count: entry.count,
        limit: config.rateLimit.maxRequests
      }
    })

    reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    })
    return
  }
}

/**
 * Strict rate limiting for sensitive endpoints (login, password reset, etc.)
 */
export async function strictRateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const ip = getClientIP(request)
  const key = `strict:${ip}:${request.url}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.strictRateLimit.windowMs }
    rateLimitStore.set(key, entry)
  }

  entry.count++

  if (entry.count > config.strictRateLimit.maxRequests) {
    await logSecurityEvent(AuditEventType.RATE_LIMIT_EXCEEDED, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
      details: {
        path: request.url,
        count: entry.count,
        limit: config.strictRateLimit.maxRequests,
        type: 'strict'
      }
    })

    reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Too many attempts. Please wait before trying again.',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    })
    return
  }
}

/**
 * Brute force protection for login attempts
 */
export async function checkBruteForce(
  identifier: string,
  ip: string
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil: number | null }> {
  const key = `login:${identifier}:${ip}`
  const now = Date.now()

  let entry = loginAttemptStore.get(key)

  if (!entry) {
    entry = { attempts: 0, lockedUntil: null }
    loginAttemptStore.set(key, entry)
  }

  // Check if locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil
    }
  }

  // Reset if lock expired
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    entry.attempts = 0
    entry.lockedUntil = null
  }

  return {
    allowed: true,
    remainingAttempts: config.bruteForce.maxAttempts - entry.attempts,
    lockedUntil: null
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedLogin(identifier: string, ip: string): Promise<void> {
  const key = `login:${identifier}:${ip}`
  let entry = loginAttemptStore.get(key)

  if (!entry) {
    entry = { attempts: 0, lockedUntil: null }
    loginAttemptStore.set(key, entry)
  }

  entry.attempts++

  if (entry.attempts >= config.bruteForce.maxAttempts) {
    entry.lockedUntil = Date.now() + config.bruteForce.lockoutDuration

    await logSecurityEvent(AuditEventType.BRUTE_FORCE_ATTEMPT, {
      ipAddress: ip,
      details: {
        identifier,
        attempts: entry.attempts,
        lockedUntil: new Date(entry.lockedUntil).toISOString()
      }
    })
  }
}

/**
 * Reset login attempts on successful login
 */
export function resetLoginAttempts(identifier: string, ip: string): void {
  const key = `login:${identifier}:${ip}`
  loginAttemptStore.delete(key)
}

/**
 * Block an IP address
 */
export async function blockIP(ip: string, reason: string): Promise<void> {
  blockedIPs.add(ip)

  await logSecurityEvent(AuditEventType.IP_BLOCKED, {
    ipAddress: ip,
    details: { reason }
  })
}

/**
 * Unblock an IP address
 */
export function unblockIP(ip: string): void {
  blockedIPs.delete(ip)
}

/**
 * Check request for suspicious patterns
 */
export async function validateRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const ip = getClientIP(request)
  const dataToCheck: string[] = []

  // Collect data to check
  if (request.url) dataToCheck.push(request.url)
  if (typeof request.body === 'string') dataToCheck.push(request.body)
  if (typeof request.body === 'object' && request.body) {
    dataToCheck.push(JSON.stringify(request.body))
  }

  const combined = dataToCheck.join(' ')

  // Check for suspicious patterns
  for (const pattern of config.suspiciousPatterns) {
    if (pattern.test(combined)) {
      await logSecurityEvent(AuditEventType.SUSPICIOUS_ACTIVITY, {
        ipAddress: ip,
        userAgent: request.headers['user-agent'],
        details: {
          path: request.url,
          pattern: pattern.toString(),
          method: request.method
        }
      })

      reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid request'
      })
      return
    }
  }
}

/**
 * Security headers middleware
 */
export async function securityHeaders(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Prevent clickjacking
  reply.header('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  reply.header('X-Content-Type-Options', 'nosniff')

  // Enable XSS filter
  reply.header('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy
  reply.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
  )

  // HSTS (only in production with HTTPS)
  if (process.env['NODE_ENV'] === 'production') {
    reply.header(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Permissions Policy
  reply.header(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  )
}

/**
 * Register all security middleware on Fastify instance
 */
export async function registerSecurityMiddleware(fastify: FastifyInstance): Promise<void> {
  // Add security headers to all responses
  fastify.addHook('onSend', securityHeaders)

  // Rate limit all requests
  fastify.addHook('preHandler', rateLimitMiddleware)

  // Validate all requests for suspicious patterns
  fastify.addHook('preHandler', validateRequest)
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()

  // Cleanup rate limit entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }

  // Cleanup login attempt entries
  for (const [key, entry] of loginAttemptStore.entries()) {
    if (entry.lockedUntil && now > entry.lockedUntil + config.bruteForce.lockoutDuration) {
      loginAttemptStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
