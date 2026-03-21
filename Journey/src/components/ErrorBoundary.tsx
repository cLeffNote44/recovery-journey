import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, WifiOff, Clock, ShieldX, ServerOff } from 'lucide-react'
import { captureException } from '../services/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })

    // Report to monitoring providers (Sentry, LogRocket, etc.)
    captureException(error, {
      componentStack: errorInfo.componentStack ?? undefined,
    })
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left overflow-auto max-h-40">
                <p className="text-sm font-mono text-red-700 dark:text-red-300">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <button
              onClick={this.handleRefresh}
              className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// =============================================================================
// API Error Display Components
// These are functional components for displaying specific API error states
// =============================================================================

export type ApiErrorType = 'network' | 'timeout' | 'unauthorized' | 'forbidden' | 'not_found' | 'server' | 'unknown'

interface ApiErrorDisplayProps {
  type: ApiErrorType
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
  compact?: boolean
}

const errorConfig: Record<ApiErrorType, {
  icon: typeof WifiOff
  title: string
  description: string
  bgColor: string
  iconBgColor: string
  iconColor: string
}> = {
  network: {
    icon: WifiOff,
    title: 'Connection Lost',
    description: 'Unable to connect to the server. Please check your internet connection and try again.',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    iconBgColor: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  timeout: {
    icon: Clock,
    title: 'Request Timed Out',
    description: 'The server took too long to respond. Please try again in a moment.',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  unauthorized: {
    icon: ShieldX,
    title: 'Session Expired',
    description: 'Your session has expired. Please log in again to continue.',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  forbidden: {
    icon: ShieldX,
    title: 'Access Denied',
    description: "You don't have permission to access this resource. Contact your administrator if you believe this is an error.",
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  not_found: {
    icon: AlertTriangle,
    title: 'Not Found',
    description: 'The requested resource could not be found. It may have been moved or deleted.',
    bgColor: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    iconBgColor: 'bg-gray-100 dark:bg-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  server: {
    icon: ServerOff,
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified and is working on it.',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconBgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  unknown: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconBgColor: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
}

/**
 * Determines the error type from an Error object or HTTP status code
 */
export function getApiErrorType(error: Error | unknown, statusCode?: number): ApiErrorType {
  // Check status code first
  if (statusCode) {
    if (statusCode === 401) return 'unauthorized'
    if (statusCode === 403) return 'forbidden'
    if (statusCode === 404) return 'not_found'
    if (statusCode === 408 || statusCode === 504) return 'timeout'
    if (statusCode >= 500) return 'server'
  }

  // Check error message patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
      return 'network'
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout'
    }
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'unauthorized'
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return 'forbidden'
    }
    if (message.includes('404') || message.includes('not found')) {
      return 'not_found'
    }
    if (message.includes('500') || message.includes('server error')) {
      return 'server'
    }
  }

  return 'unknown'
}

/**
 * Displays an API error with appropriate styling and actions based on error type.
 * Use this for inline error displays within page content.
 */
export function ApiErrorDisplay({ type, message, onRetry, onGoBack, compact = false }: ApiErrorDisplayProps) {
  const config = errorConfig[type]
  const Icon = config.icon

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${config.bgColor}`}
        role="alert"
        aria-live="polite"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {config.title}
          </p>
          {message && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {message}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Retry"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`p-6 rounded-xl border ${config.bgColor} text-center`}
      role="alert"
      aria-live="polite"
    >
      <div className={`w-12 h-12 ${config.iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {config.title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
        {message || config.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Back
          </button>
        )}
        {type === 'unauthorized' && (
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Log In Again
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Full-page API error display for critical failures
 */
export function FullPageApiError({ type, message, onRetry }: Omit<ApiErrorDisplayProps, 'compact'>) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className={`w-16 h-16 ${config.iconBgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {message || config.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {type === 'unauthorized' && (
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
          >
            Return to login
          </button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// React Error Boundary Components (Class-based)
// =============================================================================

// A smaller error boundary for sections within a page
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SectionErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })

    // Report to monitoring providers (Sentry, LogRocket, etc.)
    captureException(error, {
      boundary: 'SectionErrorBoundary',
      componentStack: errorInfo.componentStack ?? undefined,
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load this section
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
