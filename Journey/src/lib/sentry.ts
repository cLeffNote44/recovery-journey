/* eslint-disable no-console -- intentional fallback diagnostics; stripped from prod builds */
import * as Sentry from '@sentry/react'

/**
 * Initialize Sentry error tracking
 *
 * Sentry captures:
 * - Unhandled JavaScript errors
 * - React component errors via ErrorBoundary integration
 * - Performance metrics (transactions, spans)
 * - User context for debugging
 *
 * Configuration is read from environment variables:
 * - VITE_SENTRY_DSN: Your Sentry project DSN
 * - VITE_SENTRY_ENVIRONMENT: 'development' | 'staging' | 'production'
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

  // Only initialize if DSN is provided
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.log('[Sentry] No DSN provided, error tracking disabled')
    }
    return
  }

  Sentry.init({
    dsn,
    environment,

    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session replay (captures user interactions for debugging)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integration configuration
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text content for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out known non-actionable errors
    beforeSend(event, hint) {
      const error = hint.originalException

      // Ignore network errors when offline
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          return null
        }
        // Ignore canceled requests
        if (error.message.includes('canceled') || error.message.includes('aborted')) {
          return null
        }
      }

      return event
    },

    // Don't send errors in development unless explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true',
  })

  console.log(`[Sentry] Initialized for ${environment} environment`)
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setSentryUser(user: { id: string; email?: string; role?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      // Custom data
      role: user.role,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Add custom context for debugging
 */
export function setSentryContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context)
}

/**
 * Capture a custom error with optional extra context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture a custom message (for non-error logging)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * Create a performance transaction for measuring operations
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({ name, op })
}

// Re-export Sentry's ErrorBoundary for use in React components
export { ErrorBoundary as SentryErrorBoundary } from '@sentry/react'
