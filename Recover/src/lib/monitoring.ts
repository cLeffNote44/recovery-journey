/**
 * Monitoring Service for Recover (Patient App)
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
 *
 * HIPAA / Privacy:
 * - All text is masked in session replays
 * - All media is blocked in session replays
 * - Only user ID is sent as user context (no email, no PHI)
 * - Network errors from spotty mobile connectivity are filtered out
 */

import * as Sentry from '@sentry/react';

let isInitialized = false;

/**
 * Initialize all monitoring providers.
 * Call this once at app startup, before rendering.
 */
export function initMonitoring(): void {
  if (isInitialized) return;
  isInitialized = true;

  // --- Sentry ---
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
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
      beforeSend(event, hint) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore network errors (common on mobile with spotty connectivity)
          if (
            error.message.includes('Network request failed') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('Load failed')
          ) {
            return null;
          }
          if (error.message.includes('canceled') || error.message.includes('aborted')) {
            return null;
          }
        }
        return event;
      },
      enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_FORCE_ENABLE === 'true',
    });

    if (import.meta.env.DEV) {
      console.log(`[Monitoring] Sentry initialized for ${environment}`);
    }
  } else if (import.meta.env.DEV) {
    console.log('[Monitoring] No Sentry DSN provided, error tracking disabled');
  }

  // --- LogRocket ---
  // LogRocket integration stub. When the team is ready:
  // 1. npm install logrocket
  // 2. Uncomment the block below
  // 3. Set VITE_LOGROCKET_ID in .env
  /*
  const logRocketId = import.meta.env.VITE_LOGROCKET_ID;
  if (logRocketId) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.init(logRocketId, {
        dom: {
          // HIPAA: redact all text inputs
          inputSanitizer: true,
          textSanitizer: true,
        },
        network: {
          requestSanitizer: (request) => {
            if (request.headers?.Authorization) {
              request.headers.Authorization = '[REDACTED]';
            }
            return request;
          },
        },
      });
      if (import.meta.env.DEV) {
        console.log('[Monitoring] LogRocket initialized');
      }
    });
  }
  */

  // --- Global error handlers ---
  // Catch unhandled errors that escape React error boundaries
  window.addEventListener('error', (event) => {
    captureException(event.error || new Error(event.message), {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(`Unhandled Promise Rejection: ${event.reason}`);
    captureException(error, {
      source: 'unhandledrejection',
    });
  });
}

/**
 * Capture an exception and send it to all configured monitoring providers.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (for non-error events like warnings or informational logs).
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set the current user context for error tracking.
 * Call after user profile setup. Pass null to clear.
 *
 * HIPAA: Only send the user ID — no email, no PHI.
 */
export function setUser(user: { id: string } | null): void {
  Sentry.setUser(user ? { id: user.id } : null);

  // LogRocket user identification stub
  /*
  if (user) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.identify(user.id);
    });
  }
  */
}

/**
 * Set additional context for debugging (e.g., device info, feature flags).
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.setContext(name, context);
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}
