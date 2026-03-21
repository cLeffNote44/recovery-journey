import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { generatePageNumbers, formatPaginationRange } from '../../hooks/usePagination'

interface PaginationProps {
  /** Current page (1-indexed) */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  total: number
  /** Items per page */
  pageSize: number
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Whether there is a next page */
  hasNextPage: boolean
  /** Whether there is a previous page */
  hasPrevPage: boolean
  /** Go to a specific page */
  onPageChange: (page: number) => void
  /** Change page size */
  onPageSizeChange?: (pageSize: number) => void
  /** Whether data is loading */
  isLoading?: boolean
  /** Show page size selector */
  showPageSize?: boolean
  /** Show item range text */
  showRange?: boolean
  /** Compact mode (for smaller screens) */
  compact?: boolean
}

/**
 * Pagination controls component
 *
 * Features:
 * - Page number buttons with ellipsis
 * - First/last, prev/next navigation
 * - Page size selector
 * - Item range display
 * - Loading state
 * - Responsive compact mode
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showPageSize = true,
  showRange = true,
  compact = false,
}: PaginationProps) {
  const pageNumbers = generatePageNumbers(page, totalPages)

  return (
    <div
      className={`flex items-center justify-between gap-4 ${compact ? 'flex-col sm:flex-row' : ''}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Left side: Page size and range */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="sr-only sm:not-sr-only">
              Rows per page:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRange && (
          <span className="text-gray-500">
            {formatPaginationRange(page, pageSize, total)}
          </span>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to first page"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to previous page"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Page numbers */}
        {!compact && (
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((pageNum, index) =>
              pageNum === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  aria-current={pageNum === page ? 'page' : undefined}
                  className={`min-w-[2rem] px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        )}

        {/* Compact page display */}
        {compact && (
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
        )}

        {/* Next page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to next page"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Go to last page"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/**
 * Simple pagination with just prev/next buttons
 */
export function SimplePagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isLoading = false,
}: Pick<
  PaginationProps,
  'page' | 'totalPages' | 'hasNextPage' | 'hasPrevPage' | 'onPageChange' | 'isLoading'
>) {
  return (
    <div className="flex items-center justify-between" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage || isLoading}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage || isLoading}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export default Pagination
