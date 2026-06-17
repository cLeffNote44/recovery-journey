/**
 * Test setup and helpers for Backend route testing.
 *
 * Uses Fastify's .inject() for in-process HTTP simulation
 * and mocks Prisma at the module level.
 */

import { vi } from 'vitest'

// ─── Module Mocks (hoisted to top by Vitest) ────────────────────────────────

vi.mock('../lib/prisma.js', () => {
  const m = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  })
  return {
    prisma: {
      staff: m(),
      patient: m(),
      facility: m(),
      refreshToken: m(),
      registrationKey: m(),
      patientDevice: m(),
      checkIn: m(),
      craving: m(),
      patientGoal: m(),
      treatmentAssignment: m(),
      auditLog: m(),
      message: m(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      $transaction: vi.fn((fns: any[]) => Promise.all(fns)),
    },
  }
})

vi.mock('../lib/audit-log.js', () => {
  const logger = {
    log: vi.fn().mockResolvedValue(undefined),
    loginSuccess: vi.fn().mockResolvedValue(undefined),
    loginFailed: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    checkInSync: vi.fn().mockResolvedValue(undefined),
  }
  return {
    AuditLogger: class MockAuditLogger {
      static fromRequest() { return logger }
      constructor() { return logger as any }
    },
  }
})

vi.mock('../lib/audit.js', () => ({
  auditLogger: { shutdown: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('../lib/metrics.js', () => ({
  metricsMiddleware: vi.fn((_req: any, _reply: any, done: () => void) => done()),
  registerMetricsEndpoint: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../middleware/security.js', () => ({
  registerSecurityMiddleware: vi.fn().mockResolvedValue(undefined),
  checkBruteForce: vi.fn().mockResolvedValue({ allowed: true, remainingAttempts: 5, lockedUntil: null }),
  recordFailedLogin: vi.fn().mockResolvedValue(undefined),
  resetLoginAttempts: vi.fn(),
}))

vi.mock('../middleware/sanitize.js', () => ({
  sanitizeRequestBody: vi.fn((_req: any, _reply: any, done: () => void) => done()),
}))

vi.mock('../websocket/handler.js', () => ({
  websocketHandler: vi.fn(),
  broadcastToUser: vi.fn(),
}))

vi.mock('../lib/logger.js', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

vi.mock('../config/env.js', () => ({
  config: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-key-that-is-long-enough-for-testing',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-that-is-long-enough',
    AUDIT_SECRET: 'test-audit-secret-key-for-ci-only',
    JWT_EXPIRES_IN: '1h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    PORT: 8000,
    HOST: '0.0.0.0',
    NODE_ENV: 'test',
    CORS_ORIGINS: ['http://localhost:5173'],
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_WINDOW_MS: 60000,
    AUDIT_LOG_RETENTION_DAYS: 2555,
    REGISTRATION_KEY_EXPIRES_HOURS: 72,
    WS_HEARTBEAT_INTERVAL_MS: 30000,
  },
}))

// ─── Re-export the mock for test access ─────────────────────────────────────

import { prisma } from '../lib/prisma.js'

// Cast to any so tests can call .mockResolvedValue() etc.
export const mockPrisma = prisma as any

// ─── Fastify App Builder ────────────────────────────────────────────────────

import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import { authRoutes } from '../routes/auth.js'
import { patientSyncRoutes } from '../routes/patient-sync.js'
import { adminRoutes } from '../routes/admin.js'
import { messageRoutes } from '../routes/messages.js'
import { dashboardRoutes } from '../routes/dashboard.js'
import { errorHandler } from '../lib/error-handler.js'

export const TEST_JWT_SECRET = 'test-secret-key-that-is-long-enough-for-testing'

export async function buildApp() {
  const app = Fastify({ logger: false })

  await app.register(jwt, {
    secret: TEST_JWT_SECRET,
    sign: { expiresIn: '1h' },
  })

  app.setErrorHandler(errorHandler)
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(patientSyncRoutes, { prefix: '/api/v1/sync' })
  app.register(adminRoutes, { prefix: '/api/v1/admin' })
  app.register(messageRoutes, { prefix: '/api/v1/messages' })
  app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

  await app.ready()
  return app
}

// ─── Test Data Factories ────────────────────────────────────────────────────

export function makeStaff(overrides: Record<string, any> = {}) {
  return {
    id: 'staff-1',
    email: 'clinician@test.com',
    firstName: 'Jane',
    lastName: 'Doe',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWX',
    role: 'COUNSELOR',
    status: 'ACTIVE',
    facilityId: 'facility-1',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    tokenVersion: 0,
    facility: { id: 'facility-1', name: 'Test Facility' },
    ...overrides,
  }
}

export function makePatient(overrides: Record<string, any> = {}) {
  return {
    id: 'patient-1',
    firstName: 'John',
    lastName: 'Smith',
    status: 'ACTIVE',
    facilityId: 'facility-1',
    sobrietyDate: new Date('2024-01-01'),
    assignedCounselorId: 'staff-1',
    facility: { id: 'facility-1', name: 'Test Facility', phone: '555-0100' },
    assignedCounselor: { id: 'staff-1', firstName: 'Jane', lastName: 'Doe' },
    ...overrides,
  }
}

export function makeRegKey(overrides: Record<string, any> = {}) {
  return {
    id: 'regkey-1',
    key: 'TESTKEY123',
    patientId: 'patient-1',
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    usedAt: null,
    patient: makePatient(),
    ...overrides,
  }
}

export function signTestToken(app: ReturnType<typeof Fastify>, payload: Record<string, any>) {
  return app.jwt.sign(payload)
}
