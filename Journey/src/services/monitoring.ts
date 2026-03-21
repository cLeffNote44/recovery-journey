/**
 * Monitoring Service for Journey (Clinician App)
 *
 * Provides a provider-agnostic monitoring integration layer.
 * Currently supports Sentry via @sentry/react. If no VITE_SENTRY_DSN
 * is configured, all functions gracefully degrade to no-ops.
 *
 * LogRocket can be added alongside Sentry by setting VITE_LOGROCKET_ID.
 *
 * Environment variables:
 * - VITE_SENTRY_DSN: Sentry project DSN
 * - VITE_SENTRY_ENVIRONMENT: 'development' | 'staging' | 'production'
 * - VITE_SENTRY_FORCE_ENABLE: 'true' to enable in development
 * - VITE_LOGROCKET_ID: LogRocket application ID (e.g., 'org/app')
 */

import * as Sentry from '@sentry/react'

let isInitialized = false
let logRocketIdentified = false

/**
 * Initialize all monitoring providers.
 * Call this once at app startup, before rendering.
 */
export function initMonitoring(): void {
  if (isInitialized) return
  isInitialized = true

  // --- Sentry ---
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment,

      // Performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

      // Session replay (captures user interactions for debugging)
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // HIPAA: mask all text content and block media for privacy
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Filter out known non-actionable errors
      beforeSend(event, hint) {
        const error = hint.originalException
        if (error instanceof Error) {
          if (error.message.includes('Network request failed')) return null
          if (error.message.includes('canceled') || error.message.includes('aborted')) return null
        }
        return event
      },

      // Don't send errors in development unless explicitly enabled
      enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true',
    })

    if (import.meta.env.DEV) {
      console.log(`[Monitoring] Sentry initialized for ${environment}`)
    }
  } else if (import.meta.env.DEV) {
    console.log('[Monitoring] No Sentry DSN provided, error tracking disabled')
  }

  // --- LogRocket ---
  // LogRocket integration stub. When the team is ready:
  // 1. npm install logrocket
  // 2. Uncomment the block below
  // 3. Set VITE_LOGROCKET_ID in .env
  /*
  const logRocketId = import.meta.env.VITE_LOGROCKET_ID
  if (logRocketId) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.init(logRocketId, {
        dom: {
          // HIPAA: redact all text inputs
          inputSanitizer: true,
          textSanitizer: true,
        },
        network: {
          // Redact authorization headers
          requestSanitizer: (request) => {
            if (request.headers?.Authorization) {
              request.headers.Authorization = '[REDACTED]'
            }
            return request
          },
        },
      })
      // Connect LogRocket to Sentry for linked sessions
      if (sentryDsn) {
        import('logrocket').then((LR) => {
          LR.default.getSessionURL((sessionURL) => {
            Sentry.setContext('logrocket', { sessionURL })
          })
        })
      }
      if (import.meta.env.DEV) {
        console.log('[Monitoring] LogRocket initialized')
      }
    })
  }
  */
}

/**
 * Capture an exception and send it to all configured monitoring providers.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
  })

  // LogRocket captures errors automatically via Sentry integration,
  // but explicit capture can be added here if needed.
}

/**
 * Capture a message (for non-error events like warnings or informational logs).
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, level)
}

/**
 * Set the current user context for error tracking.
 * Call after authentication. Pass null on logout to clear.
 *
 * Only non-PHI identifiers should be sent (id, email, role).
 */
export function setUser(user: { id: string; email?: string; role?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  } else {
    Sentry.setUser(null)
  }

  // LogRocket user identification stub
  /*
  if (user && !logRocketIdentified) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.identify(user.id, {
        email: user.email,
        role: user.role,
      })
      logRocketIdentified = true
    })
  }
  */
}

/**
 * Set additional context for debugging (e.g., facility info, feature flags).
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.setContext(name, context)
}

/**
 * Create a performance span for measuring operations.
 */
export function startSpan(name: string, op: string) {
  return Sentry.startInactiveSpan({ name, op })
}

// Re-export Sentry's ErrorBoundary for React component usage
export { ErrorBoundary as SentryErrorBoundary } from '@sentry/react'
