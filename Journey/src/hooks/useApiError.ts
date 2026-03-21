import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'
import { showToast } from '../components/Toast'
import { getApiErrorType, type ApiErrorType } from '../components/ErrorBoundary'

// =============================================================================
// TYPES
// =============================================================================

export interface ApiError {
  type: ApiErrorType
  message: string
  statusCode?: number
  details?: Record<string, string[]>
  originalError?: Error
}

interface UseApiErrorOptions {
  /** Show toast notification on error (default: true) */
  showToastOnError?: boolean
  /** Custom error messages by error type */
  customMessages?: Partial<Record<ApiErrorType, string>>
  /** Callback when error occurs */
  onError?: (error: ApiError) => void
}

interface UseApiErrorReturn {
  error: ApiError | null
  setError: (error: Error | AxiosError | unknown) => void
  clearError: () => void
  handleError: (error: Error | AxiosError | unknown) => ApiError
  isError: boolean
  errorType: ApiErrorType | null
}

// =============================================================================
// ERROR PARSING
// =============================================================================

/**
 * Extracts status code from various error formats
 */
function getStatusCode(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status
  }
  if (error instanceof Error) {
    const match = error.message.match(/\b([45]\d{2})\b/)
    return match ? parseInt(match[1], 10) : undefined
  }
  return undefined
}

/**
 * Extracts validation details from API error response
 */
function getValidationDetails(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      // FastAPI validation error format
      if ('detail' in data && Array.isArray(data.detail)) {
        const details: Record<string, string[]> = {}
        for (const err of data.detail) {
          const field = err.loc?.slice(-1)[0] || 'general'
          if (!details[field]) details[field] = []
          details[field].push(err.msg)
        }
        return details
      }
      // Standard errors object format
      if ('errors' in data && typeof data.errors === 'object') {
        return data.errors as Record<string, string[]>
      }
    }
  }
  return undefined
}

/**
 * Gets user-friendly error message
 */
function getErrorMessage(error: unknown, statusCode?: number): string {
  // Axios error with response
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data
    if (typeof data === 'object') {
      // Various API error formats
      if ('message' in data && typeof data.message === 'string') return data.message
      if ('error' in data && typeof data.error === 'string') return data.error
      if ('detail' in data && typeof data.detail === 'string') return data.detail
    }
    if (typeof data === 'string') return data
  }

  // Standard error message
  if (error instanceof Error) {
    // Don't expose stack traces in messages
    const msg = error.message
    if (!msg.includes('at ') && msg.length < 200) {
      return msg
    }
  }

  // Fallback based on status code
  if (statusCode) {
    if (statusCode === 401) return 'Your session has expired. Please log in again.'
    if (statusCode === 403) return 'You do not have permission to perform this action.'
    if (statusCode === 404) return 'The requested resource was not found.'
    if (statusCode === 422) return 'Please check your input and try again.'
    if (statusCode === 429) return 'Too many requests. Please wait a moment.'
    if (statusCode >= 500) return 'A server error occurred. Please try again later.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Parses any error into a structured ApiError
 */
export function parseApiError(error: unknown): ApiError {
  const statusCode = getStatusCode(error)
  const errorType = getApiErrorType(error, statusCode)
  const message = getErrorMessage(error, statusCode)
  const details = getValidationDetails(error)

  return {
    type: errorType,
    message,
    statusCode,
    details,
    originalError: error instanceof Error ? error : undefined,
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for handling API errors with consistent patterns
 *
 * @example
 * ```tsx
 * const { error, handleError, clearError } = useApiError({
 *   showToastOnError: true,
 *   customMessages: {
 *     network: 'Unable to reach the server. Check your connection.',
 *   },
 * })
 *
 * try {
 *   await api.doSomething()
 * } catch (e) {
 *   handleError(e)
 * }
 * ```
 */
export function useApiError(options: UseApiErrorOptions = {}): UseApiErrorReturn {
  const { showToastOnError = true, customMessages = {}, onError } = options

  const [error, setErrorState] = useState<ApiError | null>(null)

  const handleError = useCallback(
    (rawError: Error | AxiosError | unknown): ApiError => {
      const parsed = parseApiError(rawError)

      // Apply custom message if provided
      if (customMessages[parsed.type]) {
        parsed.message = customMessages[parsed.type]!
      }

      setErrorState(parsed)

      // Show toast notification
      if (showToastOnError) {
        switch (parsed.type) {
          case 'network':
          case 'timeout':
            showToast.warning(parsed.message)
            break
          case 'unauthorized':
            showToast.info(parsed.message)
            break
          case 'forbidden':
          case 'server':
          case 'unknown':
            showToast.error(parsed.message)
            break
          case 'not_found':
            // Often don't need toast for 404
            break
        }
      }

      // Call custom error handler
      onError?.(parsed)

      return parsed
    },
    [showToastOnError, customMessages, onError]
  )

  const setError = useCallback(
    (rawError: Error | AxiosError | unknown) => {
      handleError(rawError)
    },
    [handleError]
  )

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  return {
    error,
    setError,
    clearError,
    handleError,
    isError: error !== null,
    errorType: error?.type ?? null,
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Type guard to check if an error is a specific API error type
 */
export function isApiErrorType(error: ApiError | null, type: ApiErrorType): boolean {
  return error?.type === type
}

/**
 * Check if error has validation details for a specific field
 */
export function hasFieldError(error: ApiError | null, field: string): boolean {
  return !!error?.details?.[field]?.length
}

/**
 * Get validation error for a specific field
 */
export function getFieldError(error: ApiError | null, field: string): string | undefined {
  return error?.details?.[field]?.[0]
}

/**
 * Get all validation errors as a flat list
 */
export function getAllFieldErrors(error: ApiError | null): string[] {
  if (!error?.details) return []
  return Object.values(error.details).flat()
}
