import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  usePagination,
  generatePageNumbers,
  formatPaginationRange,
  type PaginatedResponse,
  type PaginationParams,
} from './usePagination'

// Create wrapper with fresh QueryClient for each test
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

// Mock data and fetch function
const createMockResponse = (
  page: number,
  pageSize: number,
  total: number = 100
): PaginatedResponse<{ id: number }> => {
  const totalPages = Math.ceil(total / pageSize)
  const items = Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
  }))

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', async () => {
    const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25))

    const { result } = renderHook(
      () =>
        usePagination({
          queryKey: (params) => ['test', params],
          queryFn: mockFn,
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(25)
    expect(result.current.sortOrder).toBe('asc')
  })

  it('should initialize with custom initial values', async () => {
    const mockFn = vi.fn().mockResolvedValue(createMockResponse(2, 50))

    const { result } = renderHook(
      () =>
        usePagination({
          queryKey: (params) => ['test', params],
          queryFn: mockFn,
          initialPage: 2,
          initialPageSize: 50,
          initialSortBy: 'name',
          initialSortOrder: 'desc',
          initialFilters: { status: 'active' },
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.page).toBe(2)
    expect(result.current.pageSize).toBe(50)
    expect(result.current.sortBy).toBe('name')
    expect(result.current.sortOrder).toBe('desc')
    expect(result.current.filters).toEqual({ status: 'active' })
  })

  it('should fetch data and update state', async () => {
    const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25, 100))

    const { result } = renderHook(
      () =>
        usePagination({
          queryKey: (params) => ['test', params],
          queryFn: mockFn,
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.data.length).toBe(25)
    })

    expect(result.current.total).toBe(100)
    expect(result.current.totalPages).toBe(4)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPrevPage).toBe(false)
  })

  describe('navigation', () => {
    it('should go to a specific page', async () => {
      const mockFn = vi.fn().mockImplementation((params: PaginationParams) =>
        Promise.resolve(createMockResponse(params.page, params.pageSize))
      )

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.page).toBe(3)
    })

    it('should go to next page', async () => {
      const mockFn = vi.fn().mockImplementation((params: PaginationParams) =>
        Promise.resolve(createMockResponse(params.page, params.pageSize))
      )

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true)
      })

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('should go to previous page', async () => {
      const mockFn = vi.fn().mockImplementation((params: PaginationParams) =>
        Promise.resolve(createMockResponse(params.page, params.pageSize))
      )

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 3,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.hasPrevPage).toBe(true)
      })

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('should go to first page', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(3, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 3,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.firstPage()
      })

      expect(result.current.page).toBe(1)
    })

    it('should go to last page', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25, 100))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.totalPages).toBe(4)
      })

      act(() => {
        result.current.lastPage()
      })

      expect(result.current.page).toBe(4)
    })
  })

  describe('page size', () => {
    it('should change page size and reset to first page', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(2, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 2,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setPageSize(50)
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(50)
    })
  })

  describe('sorting', () => {
    it('should set sort and reset to first page', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(2, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 2,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSort('name', 'desc')
      })

      expect(result.current.page).toBe(1)
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('desc')
    })

    it('should toggle sort direction', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialSortBy: 'name',
            initialSortOrder: 'asc',
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Toggle same field - should flip direction
      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sortOrder).toBe('desc')

      // Toggle again - should flip back
      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sortOrder).toBe('asc')
    })

    it('should reset to asc when toggling different field', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialSortBy: 'name',
            initialSortOrder: 'desc',
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.toggleSort('email')
      })

      expect(result.current.sortBy).toBe('email')
      expect(result.current.sortOrder).toBe('asc')
    })
  })

  describe('filters', () => {
    it('should update filters and reset to first page', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(2, 25))

      const { result } = renderHook(
        () =>
          usePagination<{ id: number }, { status?: string }>({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 2,
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      expect(result.current.page).toBe(1)
      expect(result.current.filters).toEqual({ status: 'active' })
    })

    it('should reset filters', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25))

      const { result } = renderHook(
        () =>
          usePagination<{ id: number }, { status?: string }>({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialFilters: { status: 'pending' },
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      expect(result.current.filters).toEqual({ status: 'active' })

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual({ status: 'pending' })
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const mockFn = vi.fn().mockResolvedValue(createMockResponse(1, 25))

      const { result } = renderHook(
        () =>
          usePagination({
            queryKey: (params) => ['test', params],
            queryFn: mockFn,
            initialPage: 1,
            initialPageSize: 25,
            initialSortBy: 'id',
            initialSortOrder: 'asc',
          }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Change multiple values
      act(() => {
        result.current.goToPage(3)
        result.current.setPageSize(50)
        result.current.setSort('name', 'desc')
      })

      expect(result.current.page).toBe(1) // setPageSize resets to 1
      expect(result.current.pageSize).toBe(50)
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortOrder).toBe('desc')

      // Reset all
      act(() => {
        result.current.reset()
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(25)
      expect(result.current.sortBy).toBe('id')
      expect(result.current.sortOrder).toBe('asc')
    })
  })
})

describe('generatePageNumbers', () => {
  it('should return all pages when total is less than maxVisible', () => {
    const result = generatePageNumbers(1, 5, 7)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should return ellipsis for many pages', () => {
    const result = generatePageNumbers(5, 10, 7)
    expect(result).toContain('ellipsis')
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(10)
  })

  it('should show pages at the beginning correctly', () => {
    const result = generatePageNumbers(1, 10, 7)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(10)
  })

  it('should show pages at the end correctly', () => {
    const result = generatePageNumbers(10, 10, 7)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(10)
  })

  it('should handle single page', () => {
    const result = generatePageNumbers(1, 1, 7)
    expect(result).toEqual([1])
  })
})

describe('formatPaginationRange', () => {
  it('should format range for first page', () => {
    expect(formatPaginationRange(1, 25, 100)).toBe('1-25 of 100')
  })

  it('should format range for middle page', () => {
    expect(formatPaginationRange(2, 25, 100)).toBe('26-50 of 100')
  })

  it('should format range for last page with partial items', () => {
    expect(formatPaginationRange(4, 25, 90)).toBe('76-90 of 90')
  })

  it('should handle small total', () => {
    expect(formatPaginationRange(1, 25, 10)).toBe('1-10 of 10')
  })
})
