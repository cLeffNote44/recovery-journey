import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <Loader2
      className={`animate-spin text-primary-600 dark:text-primary-400 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  )
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className}`} />
}

export function SkeletonCircle({ className = '' }: SkeletonProps) {
  return <Skeleton className={`rounded-full ${className}`} />
}

// ============================================================================
// SKELETON PATTERNS FOR SPECIFIC COMPONENTS
// ============================================================================

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="w-10 h-10" />
          <div className="space-y-2">
            <SkeletonText className="w-32" />
            <SkeletonText className="w-20" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="w-16 h-6 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <SkeletonText className="w-16" />
      </td>
      <td className="px-6 py-4">
        <SkeletonText className="w-16" />
      </td>
      <td className="px-6 py-4">
        <SkeletonText className="w-24" />
      </td>
      <td className="px-6 py-4">
        <SkeletonText className="w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="w-5 h-5" />
      </td>
    </tr>
  )
}

export function PatientTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </tbody>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonText className="w-24" />
          <Skeleton className="h-8 w-16" />
          <SkeletonText className="w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-5">
      <SkeletonText className="w-1/3 mb-4" />
      <div className="space-y-3">
        <SkeletonText className="w-full" />
        <SkeletonText className="w-4/5" />
        <SkeletonText className="w-2/3" />
      </div>
    </div>
  )
}

export function ConversationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <SkeletonCircle className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-24" />
            <SkeletonText className="w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessagesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
        >
          <Skeleton
            className={`h-16 rounded-2xl ${
              i % 2 === 0 ? 'w-2/3 rounded-bl-sm' : 'w-1/2 rounded-br-sm'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// FULL PAGE LOADING STATE
// ============================================================================

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )
}

/**
 * Loading state for lazy-loaded route components.
 * Shows a minimal loading indicator while routes are being fetched.
 */
export function PageLoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh]"
      role="status"
      aria-label="Loading page content"
    >
      <Spinner size="lg" />
      <p className="mt-4 text-gray-500 dark:text-gray-400 sr-only">Loading page...</p>
    </div>
  )
}

// ============================================================================
// LOADING WRAPPER COMPONENT
// ============================================================================

interface LoadingWrapperProps {
  isLoading: boolean
  skeleton?: ReactNode
  children: ReactNode
  error?: string | null
  onRetry?: () => void
}

export function LoadingWrapper({
  isLoading,
  skeleton,
  children,
  error,
  onRetry,
}: LoadingWrapperProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return skeleton ? <>{skeleton}</> : <PageLoading />
  }

  return <>{children}</>
}

// ============================================================================
// INLINE LOADING INDICATOR
// ============================================================================

interface InlineLoadingProps {
  text?: string
}

export function InlineLoading({ text = 'Loading' }: InlineLoadingProps) {
  return (
    <span
      className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400"
      role="status"
      aria-live="polite"
    >
      <Spinner size="sm" />
      <span>{text}</span>
    </span>
  )
}

// ============================================================================
// BUTTON LOADING STATE
// ============================================================================

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  loadingText?: string
  children: ReactNode
}

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={className}
      aria-busy={isLoading}
      aria-disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" className="text-current" />
          <span>{loadingText || children}</span>
          <span className="sr-only">Loading, please wait</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
