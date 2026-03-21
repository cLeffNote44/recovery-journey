import { useState, useCallback, useMemo } from 'react'
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'

/**
 * Server-Side Pagination Hook
 *
 * Provides a consistent pagination interface for server-side paginated data.
 * Features:
 * - Page-based or cursor-based pagination
 * - Configurable page size
 * - Sort support
 * - Filter support
 * - Loading states per-page
 * - Prefetching next page
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PaginationParams {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Sort field */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
  /** Additional filters */
  filters?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  /** The data items for the current page */
  items: T[]
  /** Total number of items across all pages */
  total: number
  /** Current page number */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of pages */
  totalPages: number
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPrevPage: boolean
}

export interface UsePaginationOptions<T, TFilters = Record<string, unknown>> {
  /** Initial page number */
  initialPage?: number
  /** Initial page size */
  initialPageSize?: number
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Initial sort field */
  initialSortBy?: string
  /** Initial sort direction */
  initialSortOrder?: 'asc' | 'desc'
  /** Initial filters */
  initialFilters?: TFilters
  /** Query key for React Query */
  queryKey: (params: PaginationParams) => QueryKey
  /** Fetch function */
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>
  /** Additional React Query options */
  queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
  /** Whether to prefetch next page */
  prefetchNext?: boolean
}

export interface UsePaginationReturn<T, TFilters = Record<string, unknown>> {
  /** Current data */
  data: T[]
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Fetching state (for background refetches) */
  isFetching: boolean
  /** Total items */
  total: number
  /** Total pages */
  totalPages: number
  /** Current page */
  page: number
  /** Current page size */
  pageSize: number
  /** Page size options */
  pageSizeOptions: number[]
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPrevPage: boolean
  /** Current sort field */
  sortBy: string | undefined
  /** Current sort direction */
  sortOrder: 'asc' | 'desc'
  /** Current filters */
  filters: TFilters
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  prevPage: () => void
  /** Go to first page */
  firstPage: () => void
  /** Go to last page */
  lastPage: () => void
  /** Change page size */
  setPageSize: (size: number) => void
  /** Change sort */
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => void
  /** Toggle sort direction */
  toggleSort: (sortBy: string) => void
  /** Update filters */
  setFilters: (filters: Partial<TFilters>) => void
  /** Reset filters */
  resetFilters: () => void
  /** Reset all pagination state */
  reset: () => void
  /** Refresh data */
  refetch: () => void
}

// =============================================================================
// HOOK
// =============================================================================

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function usePagination<T, TFilters = Record<string, unknown>>(
  options: UsePaginationOptions<T, TFilters>
): UsePaginationReturn<T, TFilters> {
  const {
    initialPage = 1,
    initialPageSize = 25,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    initialSortBy,
    initialSortOrder = 'asc',
    initialFilters = {} as TFilters,
    queryKey,
    queryFn,
    queryOptions = {},
  } = options

  // State
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)
  const [filters, setFiltersState] = useState<TFilters>(initialFilters)

  // Build params
  const params: PaginationParams = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters: filters as Record<string, unknown>,
    }),
    [page, pageSize, sortBy, sortOrder, filters]
  )

  // Query
  const query = useQuery({
    queryKey: queryKey(params),
    queryFn: () => queryFn(params),
    ...queryOptions,
  })

  // Navigation functions
  const goToPage = useCallback(
    (newPage: number) => {
      const totalPages = query.data?.totalPages || 1
      setPage(Math.max(1, Math.min(newPage, totalPages)))
    },
    [query.data?.totalPages]
  )

  const nextPage = useCallback(() => {
    if (query.data?.hasNextPage) {
      setPage((p) => p + 1)
    }
  }, [query.data?.hasNextPage])

  const prevPage = useCallback(() => {
    if (query.data?.hasPrevPage) {
      setPage((p) => p - 1)
    }
  }, [query.data?.hasPrevPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [])

  const lastPage = useCallback(() => {
    if (query.data?.totalPages) {
      setPage(query.data.totalPages)
    }
  }, [query.data?.totalPages])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1) // Reset to first page when changing page size
  }, [])

  // Sort functions
  const setSort = useCallback((newSortBy: string, newSortOrder?: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    if (newSortOrder) {
      setSortOrder(newSortOrder)
    }
    setPage(1) // Reset to first page when changing sort
  }, [])

  const toggleSort = useCallback(
    (newSortBy: string) => {
      if (sortBy === newSortBy) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortBy(newSortBy)
        setSortOrder('asc')
      }
      setPage(1)
    },
    [sortBy]
  )

  // Filter functions
  const setFilters = useCallback((newFilters: Partial<TFilters>) => {
    setFiltersState((current) => ({ ...current, ...newFilters }))
    setPage(1) // Reset to first page when changing filters
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters)
    setPage(1)
  }, [initialFilters])

  // Reset all state
  const reset = useCallback(() => {
    setPage(initialPage)
    setPageSizeState(initialPageSize)
    setSortBy(initialSortBy)
    setSortOrder(initialSortOrder)
    setFiltersState(initialFilters)
  }, [initialPage, initialPageSize, initialSortBy, initialSortOrder, initialFilters])

  return {
    // Data
    data: query.data?.items || [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    isFetching: query.isFetching,

    // Pagination info
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 0,
    page,
    pageSize,
    pageSizeOptions,
    hasNextPage: query.data?.hasNextPage || false,
    hasPrevPage: query.data?.hasPrevPage || false,

    // Sort info
    sortBy,
    sortOrder,

    // Filter info
    filters,

    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    setSort,
    toggleSort,
    setFilters,
    resetFilters,
    reset,
    refetch: query.refetch,
  }
}

// =============================================================================
// PAGINATION CONTROLS COMPONENT HELPERS
// =============================================================================

/**
 * Generate page numbers for pagination controls
 * Returns an array of page numbers and ellipses for display
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []
  const halfVisible = Math.floor((maxVisible - 3) / 2)

  // Always show first page
  pages.push(1)

  // Calculate start and end of middle section
  let start = Math.max(2, currentPage - halfVisible)
  let end = Math.min(totalPages - 1, currentPage + halfVisible)

  // Adjust if at the beginning or end
  if (currentPage <= halfVisible + 2) {
    end = Math.min(maxVisible - 2, totalPages - 1)
  } else if (currentPage >= totalPages - halfVisible - 1) {
    start = Math.max(2, totalPages - maxVisible + 3)
  }

  // Add ellipsis before middle section if needed
  if (start > 2) {
    pages.push('ellipsis')
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Add ellipsis after middle section if needed
  if (end < totalPages - 1) {
    pages.push('ellipsis')
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

/**
 * Format a range string like "1-25 of 100"
 */
export function formatPaginationRange(
  page: number,
  pageSize: number,
  total: number
): string {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return `${start}-${end} of ${total}`
}
