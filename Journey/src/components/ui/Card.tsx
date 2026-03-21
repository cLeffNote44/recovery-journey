import { ReactNode } from 'react'

// =============================================================================
// CARD COMPONENT
// =============================================================================

interface CardProps {
  /** Card content */
  children: ReactNode
  /** Card header */
  header?: ReactNode
  /** Card footer */
  footer?: ReactNode
  /** Remove padding */
  noPadding?: boolean
  /** Click handler */
  onClick?: () => void
  /** Whether card is clickable */
  clickable?: boolean
  /** Border variant */
  variant?: 'default' | 'outlined' | 'elevated'
  /** Additional CSS classes */
  className?: string
}

/**
 * Card container component
 *
 * @example
 * ```tsx
 * <Card
 *   header={<CardTitle>Patient Summary</CardTitle>}
 *   footer={<Button>View Details</Button>}
 * >
 *   <p>Patient information here...</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  header,
  footer,
  noPadding = false,
  onClick,
  clickable = false,
  variant = 'default',
  className = '',
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-md hover:shadow-lg',
  }

  const isInteractive = onClick || clickable

  return (
    <div
      className={`
        rounded-lg overflow-hidden
        ${variantClasses[variant]}
        ${isInteractive ? 'cursor-pointer transition-all duration-200 hover:border-blue-300' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {header && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">{header}</div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">{footer}</div>
      )}
    </div>
  )
}

// =============================================================================
// CARD HEADER COMPONENTS
// =============================================================================

interface CardTitleProps {
  children: ReactNode
  /** Subtitle */
  subtitle?: ReactNode
  /** Right side actions */
  actions?: ReactNode
  className?: string
}

/**
 * Card title with optional subtitle and actions
 */
export function CardTitle({ children, subtitle, actions, className = '' }: CardTitleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  /** Stat label */
  label: string
  /** Stat value */
  value: string | number
  /** Change from previous period */
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  /** Icon */
  icon?: ReactNode
  /** Icon background color */
  iconBg?: string
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Card for displaying statistics/KPIs
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Patients"
 *   value={156}
 *   change={{ value: '+12%', type: 'increase' }}
 *   icon={<Users className="h-6 w-6" />}
 *   iconBg="bg-blue-100"
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  change,
  icon,
  iconBg = 'bg-blue-100',
  onClick,
  className = '',
}: StatCardProps) {
  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <Card onClick={onClick} clickable={!!onClick} className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-1 text-sm ${changeColors[change.type]}`}>
              {change.value}
              <span className="text-gray-500 ml-1">from last period</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// =============================================================================
// CARD GRID
// =============================================================================

interface CardGridProps {
  children: ReactNode
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Grid layout for cards
 */
export function CardGrid({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

// =============================================================================
// INFO CARD COMPONENT
// =============================================================================

interface InfoCardProps {
  /** Card title */
  title: string
  /** Description */
  description?: string
  /** Icon */
  icon?: ReactNode
  /** Action button/link */
  action?: ReactNode
  /** Variant */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  className?: string
}

/**
 * Informational card with icon and action
 */
export function InfoCard({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className = '',
}: InfoCardProps) {
  const variantClasses = {
    default: 'border-gray-200 bg-white',
    info: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  }

  const iconColors = {
    default: 'text-gray-400',
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
  }

  return (
    <div
      className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}
    >
      <div className="flex gap-3">
        {icon && (
          <div className={`flex-shrink-0 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SKELETON CARD
// =============================================================================

/**
 * Loading skeleton for cards
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

export default Card
