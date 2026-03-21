/**
 * Error Tracking
 *
 * Centralized error tracking and reporting.
 * Delegates to the monitoring module (src/lib/monitoring.ts) for
 * provider integration (Sentry, LogRocket, etc.).
 *
 * This module provides a local error log buffer for debugging,
 * plus convenience wrappers around the monitoring service.
 */

import {
  captureException as monitoringCaptureException,
  captureMessage as monitoringCaptureMessage,
  setUser as monitoringSetUser,
  addBreadcrumb as monitoringAddBreadcrumb,
} from './monitoring';

export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
}

// Store errors locally for debugging
const errorLog: ErrorReport[] = [];
const MAX_ERROR_LOG_SIZE = 100;

/**
 * Initialize error tracking.
 *
 * NOTE: Monitoring providers (Sentry, etc.) are now initialized by
 * initMonitoring() in src/lib/monitoring.ts, called from main.tsx.
 * This function sets up local error handlers that feed into the
 * monitoring service.
 */
export function initErrorTracking(): void {
  // Global error handlers are now registered by initMonitoring().
  // This function is kept for backward compatibility and any
  // additional local-only error tracking setup.

  if (import.meta.env.DEV) {
    console.log('[ErrorTracking] Initialized (delegating to monitoring service)');
  }
}

/**
 * Capture an error
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  const report: ErrorReport = {
    message: errorObj.message,
    stack: errorObj.stack,
    context,
    timestamp: Date.now(),
    level: 'error',
  };

  // Add to local log
  errorLog.push(report);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[ErrorTracking]', report);
  }

  // Send to monitoring providers (Sentry, LogRocket, etc.)
  monitoringCaptureException(errorObj, {
    ...context?.tags,
    ...context?.extra,
  });
}

/**
 * Capture a warning
 */
export function captureWarning(
  message: string,
  context?: ErrorContext
): void {
  const report: ErrorReport = {
    message,
    context,
    timestamp: Date.now(),
    level: 'warning',
  };

  errorLog.push(report);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }

  if (import.meta.env.DEV) {
    console.warn('[ErrorTracking]', report);
  }

  monitoringCaptureMessage(message, 'warning');
}

/**
 * Capture an info message
 */
export function captureInfo(
  message: string,
  context?: ErrorContext
): void {
  const report: ErrorReport = {
    message,
    context,
    timestamp: Date.now(),
    level: 'info',
  };

  errorLog.push(report);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }

  if (import.meta.env.DEV) {
    console.info('[ErrorTracking]', report);
  }

  monitoringCaptureMessage(message, 'info');
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id?: string; email?: string }): void {
  if (user.id) {
    monitoringSetUser({ id: user.id });
  }

  if (import.meta.env.DEV) {
    console.log('[ErrorTracking] User context set:', user);
  }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  monitoringSetUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>
): void {
  monitoringAddBreadcrumb(message, data);

  if (import.meta.env.DEV) {
    console.log('[ErrorTracking] Breadcrumb:', message, data);
  }
}

/**
 * Get error log (for debugging)
 */
export function getErrorLog(): ErrorReport[] {
  return [...errorLog];
}

/**
 * Clear error log
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}

/**
 * Export error log as JSON
 */
export function exportErrorLog(): string {
  return JSON.stringify(errorLog, null, 2);
}

