/**
 * Structured Logging System
 *
 * Provides structured JSON logging for:
 * - Request/response logging
 * - Error tracking
 * - Performance monitoring
 * - Security events
 *
 * PHI-safe: Automatically redacts sensitive data
 */

import pino from 'pino'

// Sensitive fields to redact from logs
const REDACT_PATHS = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'authorization',
  'cookie',
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'dob',
  'medicalRecordNumber',
  'insuranceId',
  'creditCard',
  'cardNumber',
  'cvv',
  'apiKey',
  'secret',
  // Nested paths
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'body.password',
  'body.token',
  'body.ssn',
  'user.password'
]

// Log levels
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// Create base logger
const baseLogger = pino({
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),

  // Redact sensitive data
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]'
  },

  // Format options
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings['pid'],
      host: bindings['hostname'],
      service: process.env['APP_NAME'] || 'recovery-journey'
    })
  },

  // Timestamp format
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

  // Base context
  base: {
    env: process.env['NODE_ENV'] || 'development',
    version: process.env['APP_VERSION'] || '1.0.0'
  },

  // Pretty print in development
  transport:
    process.env['NODE_ENV'] !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined
})

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, unknown>): pino.Logger {
  return baseLogger.child(context)
}

/**
 * Request logger - creates a logger for a specific request
 */
export function createRequestLogger(
  requestId: string,
  userId?: string,
  facilityId?: string
): pino.Logger {
  return baseLogger.child({
    requestId,
    userId,
    facilityId
  })
}

/**
 * Log helper for consistent structured logging
 */
export const logger = {
  /**
   * Debug level logging
   */
  debug(message: string, data?: Record<string, unknown>): void {
    baseLogger.debug(data || {}, message)
  },

  /**
   * Info level logging
   */
  info(message: string, data?: Record<string, unknown>): void {
    baseLogger.info(data || {}, message)
  },

  /**
   * Warning level logging
   */
  warn(message: string, data?: Record<string, unknown>): void {
    baseLogger.warn(data || {}, message)
  },

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data }

    if (error instanceof Error) {
      errorData['error'] = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } else if (error) {
      errorData['error'] = error
    }

    baseLogger.error(errorData, message)
  },

  /**
   * Fatal level logging
   */
  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data }

    if (error instanceof Error) {
      errorData['error'] = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } else if (error) {
      errorData['error'] = error
    }

    baseLogger.fatal(errorData, message)
  },

  /**
   * Log HTTP request
   */
  request(data: {
    method: string
    url: string
    statusCode: number
    duration: number
    requestId?: string
    userId?: string
    ip?: string
    userAgent?: string
  }): void {
    const level = data.statusCode >= 500 ? 'error' : data.statusCode >= 400 ? 'warn' : 'info'

    baseLogger[level](
      {
        type: 'http',
        ...data
      },
      `${data.method} ${data.url} ${data.statusCode} ${data.duration}ms`
    )
  },

  /**
   * Log security event
   */
  security(
    event: string,
    data: {
      userId?: string
      ip?: string
      userAgent?: string
      details?: Record<string, unknown>
    }
  ): void {
    baseLogger.warn(
      {
        type: 'security',
        event,
        ...data
      },
      `Security event: ${event}`
    )
  },

  /**
   * Log database query
   */
  query(data: { operation: string; duration: number; success: boolean; error?: string }): void {
    const level = data.success ? 'debug' : 'error'

    baseLogger[level](
      {
        type: 'database',
        ...data
      },
      `DB ${data.operation} ${data.duration}ms`
    )
  },

  /**
   * Log business event
   */
  event(
    eventName: string,
    data: {
      userId?: string
      facilityId?: string
      patientId?: string
      details?: Record<string, unknown>
    }
  ): void {
    baseLogger.info(
      {
        type: 'business_event',
        event: eventName,
        ...data
      },
      `Event: ${eventName}`
    )
  },

  /**
   * Create a child logger
   */
  child(context: Record<string, unknown>): pino.Logger {
    return baseLogger.child(context)
  }
}

// Export the base logger for advanced usage
export { baseLogger }
export default logger
