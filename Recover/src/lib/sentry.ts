/**
 * Sentry Error Tracking for Recover (Patient App)
 *
 * Mirrors the Journey app's Sentry setup with patient-appropriate
 * privacy settings (masks all text, blocks all media).
 */

import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.log('[Sentry] No DSN provided, error tracking disabled')
    }
    return
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event, hint) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Ignore network errors (common on mobile with spotty connectivity)
        if (
          error.message.includes('Network request failed') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Load failed')
        ) {
          return null
        }
        if (error.message.includes('canceled') || error.message.includes('aborted')) {
          return null
        }
      }
      return event
    },
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true',
  })
}

export function setSentryUser(user: { id: string } | null) {
  Sentry.setUser(user ? { id: user.id } : null)
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}
