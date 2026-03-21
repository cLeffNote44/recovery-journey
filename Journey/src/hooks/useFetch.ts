import { useState, useEffect, useCallback, useRef } from 'react'

interface FetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isUsingFallback: boolean
}

interface UseFetchOptions<T> {
  /** Fallback data to use when the API call fails */
  fallbackData?: T
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean
  /** Dependencies that trigger a refetch */
  dependencies?: unknown[]
  /** Transform the response data before setting state */
  transform?: (data: unknown) => T
}

interface UseFetchReturn<T> extends FetchState<T> {
  /** Manually trigger a refetch */
  refetch: () => Promise<void>
  /** Reset to initial state */
  reset: () => void
}

/**
 * Custom hook for data fetching with loading states, error handling, and fallback support.
 *
 * @param fetchFn - Async function that returns the data
 * @param options - Configuration options
 * @returns Fetch state and control functions
 *
 * @example
 * const { data, isLoading, error, refetch } = useFetch(
 *   () => patientsAPI.getAll(),
 *   { fallbackData: mockPatients }
 * )
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    fallbackData,
    immediate = true,
    dependencies = [],
    transform,
  } = options

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isUsingFallback: false,
  })

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true)

  // Use ref for the fetch function to avoid dependency issues
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const executeFetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await fetchFnRef.current()
      const data = transform ? transform(result as unknown) : result

      if (isMountedRef.current) {
        setState({
          data,
          isLoading: false,
          error: null,
          isUsingFallback: false,
        })
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error')

        if (fallbackData !== undefined) {
          setState({
            data: fallbackData,
            isLoading: false,
            error,
            isUsingFallback: true,
          })
        } else {
          setState({
            data: null,
            isLoading: false,
            error,
            isUsingFallback: false,
          })
        }
      }
    }
  }, [fallbackData, transform])

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isUsingFallback: false,
    })
  }, [])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (immediate) {
      executeFetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, executeFetch, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    ...state,
    refetch: executeFetch,
    reset,
  }
}

/**
 * Hook for fetching data with automatic retry on failure.
 */
export function useFetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> & { maxRetries?: number; retryDelay?: number } = {}
): UseFetchReturn<T> & { retryCount: number } {
  const { maxRetries = 3, retryDelay = 1000, ...fetchOptions } = options
  const [retryCount, setRetryCount] = useState(0)

  const wrappedFetchFn = useCallback(async () => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fetchFn()
        setRetryCount(attempt)
        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error')
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    setRetryCount(maxRetries)
    throw lastError
  }, [fetchFn, maxRetries, retryDelay])

  const result = useFetch(wrappedFetchFn, fetchOptions)

  return { ...result, retryCount }
}

export default useFetch
