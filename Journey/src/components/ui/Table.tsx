import { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface Column<T> {
  /** Unique identifier for the column */
  id: string
  /** Column header text */
  header: string
  /** Key in data object or custom accessor function */
  accessor: keyof T | ((row: T) => ReactNode)
  /** Whether column is sortable */
  sortable?: boolean
  /** Column width (CSS value) */
  width?: string
  /** Custom cell renderer */
  cell?: (value: unknown, row: T) => ReactNode
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Additional CSS classes for cells */
  className?: string
}

export interface TableProps<T> {
  /** Array of column definitions */
  columns: Column<T>[]
  /** Data array */
  data: T[]
  /** Unique key for each row */
  getRowKey: (row: T) => string
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Sort field */
  sortBy?: string
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
  /** Sort change handler */
  onSort?: (columnId: string) => void
  /** Row click handler */
  onRowClick?: (row: T) => void
  /** Whether rows are selectable */
  selectable?: boolean
  /** Selected row keys */
  selectedKeys?: Set<string>
  /** Selection change handler */
  onSelectionChange?: (keys: Set<string>) => void
  /** Sticky header */
  stickyHeader?: boolean
  /** Striped rows */
  striped?: boolean
  /** Hover highlight */
  hoverable?: boolean
  /** Compact mode */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

// =============================================================================
// TABLE COMPONENT
// =============================================================================

/**
 * Data table component with sorting, selection, and loading states
 *
 * @example
 * ```tsx
 * const columns: Column<Patient>[] = [
 *   { id: 'name', header: 'Name', accessor: (p) => `${p.first_name} ${p.last_name}`, sortable: true },
 *   { id: 'email', header: 'Email', accessor: 'email' },
 *   { id: 'status', header: 'Status', accessor: 'status', cell: (value) => <Badge>{value}</Badge> },
 * ]
 *
 * <Table
 *   columns={columns}
 *   data={patients}
 *   getRowKey={(p) => p.id}
 *   sortBy={sortBy}
 *   sortOrder={sortOrder}
 *   onSort={toggleSort}
 *   onRowClick={(p) => navigate(`/patients/${p.id}`)}
 * />
 * ```
 */
export function Table<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  emptyMessage = 'No data available',
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  className = '',
}: TableProps<T>) {
  const handleSelectAll = () => {
    if (!onSelectionChange) return

    if (selectedKeys.size === data.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(data.map(getRowKey)))
    }
  }

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return

    const newSelection = new Set(selectedKeys)
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    onSelectionChange(newSelection)
  }

  const getCellValue = (row: T, column: Column<T>): ReactNode => {
    const accessor = column.accessor
    let value: unknown

    if (typeof accessor === 'function') {
      value = accessor(row)
    } else {
      value = row[accessor]
    }

    if (column.cell) {
      return column.cell(value, row)
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>
    }

    return String(value)
  }

  const renderSortIcon = (columnId: string) => {
    if (sortBy !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" aria-hidden="true" />
    )
  }

  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3'
  const headerPadding = compact ? 'px-3 py-2' : 'px-4 py-3'

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
          <tr>
            {selectable && (
              <th scope="col" className={`${headerPadding} w-10`}>
                <input
                  type="checkbox"
                  checked={selectedKeys.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`${headerPadding} text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                style={{ width: column.width }}
              >
                {column.sortable && onSort ? (
                  <button
                    onClick={() => onSort(column.id)}
                    className="inline-flex items-center gap-1 hover:text-gray-700 focus:outline-none"
                    aria-label={`Sort by ${column.header}`}
                  >
                    {column.header}
                    {renderSortIcon(column.id)}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center"
              >
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                <span className="mt-2 block text-sm text-gray-500">Loading...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowKey = getRowKey(row)
              const isSelected = selectedKeys.has(rowKey)

              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${hoverable ? 'hover:bg-gray-50' : ''}
                    ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                    ${isSelected ? 'bg-blue-50' : ''}
                    transition-colors
                  `}
                >
                  {selectable && (
                    <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowKey)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select row ${rowKey}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`${cellPadding} text-${column.align || 'left'} text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Table wrapper with border and shadow
 */
export function TableContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/**
 * Status badge for table cells
 */
export function StatusBadge({
  status,
  variant = 'default',
}: {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {status}
    </span>
  )
}

export default Table
