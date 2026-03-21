import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import websocket from '@fastify/websocket'
import { config } from './config/env.js'
import { authRoutes } from './routes/auth.js'
import { patientRoutes } from './routes/patients.js'
import { messageRoutes } from './routes/messages.js'
import { treatmentPlanRoutes } from './routes/treatment-plans.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { adminRoutes } from './routes/admin.js'
import { patientSyncRoutes } from './routes/patient-sync.js'
import { twoFactorRoutes } from './routes/two-factor.js'
import { healthRoutes } from './routes/health.js'
import { websocketHandler } from './websocket/handler.js'
import { errorHandler } from './lib/error-handler.js'
import { prisma } from './lib/prisma.js'
import { sanitizeRequestBody } from './middleware/sanitize.js'
import { registerSecurityMiddleware } from './middleware/security.js'
import { metricsMiddleware, registerMetricsEndpoint } from './lib/metrics.js'
import { auditLogger } from './lib/audit.js'
import logger from './lib/logger.js'

// Create Fastify instance
const app = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: config.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: { colorize: true }
    } : undefined
  }
})

// Register plugins
async function registerPlugins() {
  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production'
  })

  // CORS
  await app.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS
  })

  // JWT authentication
  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_EXPIRES_IN }
  })

  // WebSocket support
  await app.register(websocket)

  // Input sanitization (XSS protection)
  app.addHook('preHandler', sanitizeRequestBody)
  app.log.info('Input sanitization middleware enabled')

  // Security middleware (rate limiting, brute force protection, security headers)
  await registerSecurityMiddleware(app)
  app.log.info('Security middleware enabled')

  // Metrics middleware
  app.addHook('preHandler', metricsMiddleware)
  app.log.info('Metrics middleware enabled')
}

// Register routes
async function registerRoutes() {
  // Health check routes (for containers, load balancers, monitoring)
  app.register(healthRoutes)

  // Metrics endpoint (for Prometheus/Grafana)
  await registerMetricsEndpoint(app)

  // API v1 routes
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(patientRoutes, { prefix: '/api/v1/patients' })
  app.register(messageRoutes, { prefix: '/api/v1/messages' })
  app.register(treatmentPlanRoutes, { prefix: '/api/v1/treatment-plans' })
  app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
  app.register(adminRoutes, { prefix: '/api/v1/admin' })

  // Patient app sync routes (for Recover app)
  app.register(patientSyncRoutes, { prefix: '/api/v1/sync' })

  // Two-factor authentication
  app.register(twoFactorRoutes, { prefix: '/api/v1/2fa' })

  // WebSocket endpoint
  app.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, websocketHandler)
  })
}

// Set up error handling
function setupErrorHandling() {
  app.setErrorHandler(errorHandler)
}

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('Shutting down gracefully...')

  // Flush audit logs before shutdown
  await auditLogger.shutdown()
  logger.info('Audit logs flushed')

  await app.close()
  await prisma.$disconnect()
  logger.info('Shutdown complete')
  process.exit(0)
}

// Main startup
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()
    setupErrorHandling()

    // Connect to database
    await prisma.$connect()
    app.log.info('Connected to database')

    // Start server
    await app.listen({ port: config.PORT, host: config.HOST })
    app.log.info(`Server running at http://${config.HOST}:${config.PORT}`)

    // Handle shutdown signals
    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)

  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()

export { app }
