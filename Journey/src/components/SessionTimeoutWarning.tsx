import { useSessionTimeout, formatRemainingTime } from '../hooks/useSessionTimeout'
import { Clock, LogOut, RefreshCw } from 'lucide-react'

interface SessionTimeoutWarningProps {
  /** Custom timeout duration in milliseconds */
  timeoutDuration?: number
  /** Custom warning duration in milliseconds */
  warningDuration?: number
  /** Callback when session expires */
  onSessionExpired?: () => void
}

/**
 * Session timeout warning component for HIPAA compliance.
 *
 * Displays a modal warning when the user's session is about to expire,
 * giving them the option to extend their session or log out immediately.
 *
 * This component should be placed in the app layout to monitor all pages.
 */
export function SessionTimeoutWarning({
  timeoutDuration,
  warningDuration,
  onSessionExpired,
}: SessionTimeoutWarningProps) {
  const { isWarningVisible, remainingTime, extendSession, logout } = useSessionTimeout({
    timeoutDuration,
    warningDuration,
    onTimeout: onSessionExpired,
  })

  if (!isWarningVisible) {
    return null
  }

  const formattedTime = formatRemainingTime(remainingTime)
  const isUrgent = remainingTime <= 30000 // Less than 30 seconds

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              <Clock
                className={`h-8 w-8 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Title */}
          <h2
            id="session-timeout-title"
            className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2"
          >
            Session Expiring Soon
          </h2>

          {/* Description */}
          <p
            id="session-timeout-description"
            className="text-gray-600 dark:text-gray-300 text-center mb-6"
          >
            For your security, your session will expire due to inactivity.
            {' '}
            <span className={`font-semibold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
              Time remaining: {formattedTime}
            </span>
          </p>

          {/* Security notice */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This security measure protects patient information in compliance with HIPAA regulations.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={extendSession}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              autoFocus
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Stay Signed In
            </button>
            <button
              onClick={logout}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SessionTimeoutWarning
