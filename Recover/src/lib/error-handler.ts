/**
 * Centralized Error Handling
 *
 * Provides consistent error handling, logging, and user-friendly messages
 */

export enum ErrorType {
  STORAGE = 'storage',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  technical: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Create a standardized error object
 */
export function createError(
  type: ErrorType,
  message: string,
  userMessage: string,
  technical: string,
  context?: Record<string, unknown>
): AppError {
  return {
    type,
    message,
    userMessage,
    technical,
    timestamp: new Date(),
    stack: new Error().stack,
    context,
    recoverable: isRecoverable(type),
    retryable: isRetryable(type)
  };
}

/**
 * Check if error type is recoverable
 */
function isRecoverable(type: ErrorType): boolean {
  switch (type) {
    case ErrorType.NETWORK:
    case ErrorType.STORAGE:
      return true;
    case ErrorType.VALIDATION:
      return true;
    case ErrorType.AUTHENTICATION:
    case ErrorType.PERMISSION:
      return false;
    default:
      return false;
  }
}

/**
 * Check if error type is retryable
 */
function isRetryable(type: ErrorType): boolean {
  switch (type) {
    case ErrorType.NETWORK:
      return true;
    case ErrorType.STORAGE:
      return true;
    default:
      return false;
  }
}

/**
 * Log error to console with context
 */
export function logError(error: AppError): void {
  console.error(
    `[${error.type.toUpperCase()}] ${error.message}`,
    {
      timestamp: error.timestamp,
      technical: error.technical,
      context: error.context,
      stack: error.stack
    }
  );
}

/**
 * Toast interface for error messages
 */
export interface ToastInterface {
  error: (message: string, options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) => void;
}

/**
 * Show user-friendly error message
 */
export function showError(error: AppError, toast?: ToastInterface): void {
  logError(error);

  if (toast) {
    toast.error(error.userMessage, {
      duration: 5000,
      action: error.retryable ? {
        label: 'Retry',
        onClick: () => {
          // Retry logic would be implemented by caller
        }
      } : undefined
    });
  } else {
    // Fallback to alert if toast not available
    alert(error.userMessage);
  }
}

/**
 * Handle storage errors
 */
export function handleStorageError(error: unknown, context?: Record<string, unknown>): AppError {
  const technical = error instanceof Error ? error.message : String(error);

  let userMessage = 'Unable to save your data.';
  if (technical.includes('quota') || technical.includes('full')) {
    userMessage = 'Storage is full. Please export your data and free up space.';
  }

  return createError(
    ErrorType.STORAGE,
    'Storage operation failed',
    userMessage,
    technical,
    context
  );
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: unknown, context?: Record<string, unknown>): AppError {
  const technical = error instanceof Error ? error.message : String(error);

  return createError(
    ErrorType.NETWORK,
    'Network request failed',
    'Unable to connect. Please check your internet connection.',
    technical,
    context
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  field: string,
  reason: string,
  context?: Record<string, unknown>
): AppError {
  return createError(
    ErrorType.VALIDATION,
    `Validation failed for ${field}`,
    `Please check your input for ${field}: ${reason}`,
    `${field} validation failed: ${reason}`,
    { ...context, field, reason }
  );
}

/**
 * Handle authentication errors
 */
export function handleAuthError(context?: Record<string, unknown>): AppError {
  return createError(
    ErrorType.AUTHENTICATION,
    'Authentication failed',
    'Unable to verify your identity. Please try again.',
    'Authentication verification failed',
    context
  );
}

/**
 * Handle permission errors
 */
export function handlePermissionError(permission: string, context?: Record<string, unknown>): AppError {
  return createError(
    ErrorType.PERMISSION,
    `Permission denied: ${permission}`,
    `This feature requires ${permission} permission.`,
    `${permission} permission denied`,
    { ...context, permission }
  );
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error: unknown, context?: Record<string, unknown>): AppError {
  const technical = error instanceof Error ? error.message : String(error);

  return createError(
    ErrorType.UNKNOWN,
    'Unexpected error occurred',
    'Something went wrong. Please try again.',
    technical,
    context
  );
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorHandler: (error: unknown) => AppError,
  options?: {
    retry?: boolean;
    maxRetries?: number;
    showError?: boolean;
    toast?: ToastInterface;
  }
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  try {
    const data = options?.retry
      ? await retryWithBackoff(fn, options.maxRetries)
      : await fn();

    return { success: true, data };
  } catch (error) {
    const appError = errorHandler(error);

    if (options?.showError) {
      showError(appError, options.toast);
    } else {
      logError(appError);
    }

    return { success: false, error: appError };
  }
}

/**
 * Error boundary helper for React
 */
export function getErrorBoundaryMessage(error: Error): {
  title: string;
  message: string;
  technical: string;
} {
  const isChunkError = error.message.includes('chunk') || error.message.includes('Loading');

  if (isChunkError) {
    return {
      title: 'Update Required',
      message: 'A new version of the app is available. Please refresh the page to continue.',
      technical: error.message
    };
  }

  return {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try refreshing the page.',
    technical: error.message
  };
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandler(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Rejection]', event.reason);

    const error = handleUnknownError(event.reason, {
      type: 'unhandledRejection'
    });

    logError(error);

    // Show user-friendly message
    const globalToast = (window as { toast?: ToastInterface }).toast;
    if (globalToast) {
      globalToast.error(error.userMessage);
    }
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[Uncaught Error]', event.error);

    const error = handleUnknownError(event.error, {
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    logError(error);
  });
}
