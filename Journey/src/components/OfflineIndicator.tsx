import { useServiceWorker } from '../hooks/useServiceWorker'
import { WifiOff, RefreshCw, CloudOff, Loader2 } from 'lucide-react'
import { useState } from 'react'

/**
 * Offline Indicator Component
 *
 * Shows a banner when the user is offline and displays information
 * about queued requests that will sync when back online.
 */
export function OfflineIndicator() {
  const {
    isOnline,
    queuedRequestCount,
    forceSync,
  } = useServiceWorker()
  const [isSyncing, setIsSyncing] = useState(false)

  // Don't render if online and no queued requests
  if (isOnline && queuedRequestCount === 0) {
    return null
  }

  const handleSync = () => {
    setIsSyncing(true)
    forceSync()
    setTimeout(() => setIsSyncing(false), 2000)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm z-50 ${
        isOnline
          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
          : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
      } border rounded-lg shadow-lg p-4`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-full ${isOnline ? 'bg-amber-100 dark:bg-amber-800/50' : 'bg-red-100 dark:bg-red-800/50'}`}>
          {isOnline ? (
            <CloudOff className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-medium ${isOnline ? 'text-amber-900 dark:text-amber-200' : 'text-red-900 dark:text-red-200'}`}>
            {isOnline ? 'Pending Changes' : 'You Are Offline'}
          </h3>
          <p className={`text-sm mt-1 ${isOnline ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'}`}>
            {isOnline ? (
              <>
                {queuedRequestCount} change{queuedRequestCount !== 1 ? 's' : ''} waiting to sync.
              </>
            ) : (
              <>
                Some features may be limited.
                {queuedRequestCount > 0 && (
                  <> {queuedRequestCount} change{queuedRequestCount !== 1 ? 's' : ''} will sync when reconnected.</>
                )}
              </>
            )}
          </p>

          {/* Sync button when online with pending changes */}
          {isOnline && queuedRequestCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple offline banner that shows at the top of the page
 */
export function OfflineBanner() {
  const { isOnline } = useServiceWorker()

  if (isOnline) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      className="bg-red-600 dark:bg-red-700 text-white text-center py-2 px-4 text-sm"
    >
      <WifiOff className="h-4 w-4 inline-block mr-2" aria-hidden="true" />
      You are currently offline. Some features may not be available.
    </div>
  )
}

/**
 * Sync status indicator for header/nav
 */
export function SyncStatus() {
  const { isOnline, queuedRequestCount, hasUpdate, update } = useServiceWorker()

  if (isOnline && queuedRequestCount === 0 && !hasUpdate) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Offline indicator */}
      {!isOnline && (
        <div
          className="flex items-center gap-1 text-red-600"
          title="You are offline"
        >
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Offline</span>
        </div>
      )}

      {/* Pending sync indicator */}
      {queuedRequestCount > 0 && (
        <div
          className="flex items-center gap-1 text-amber-600"
          title={`${queuedRequestCount} pending changes`}
        >
          <CloudOff className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium">{queuedRequestCount}</span>
          <span className="sr-only">{queuedRequestCount} pending changes to sync</span>
        </div>
      )}

      {/* Update available */}
      {hasUpdate && (
        <button
          onClick={update}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          title="Update available - click to refresh"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Update available</span>
        </button>
      )}
    </div>
  )
}

/**
 * Update prompt modal
 */
export function UpdatePrompt() {
  const { hasUpdate, update } = useServiceWorker()

  if (!hasUpdate) {
    return null
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="update-title"
      className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 id="update-title" className="font-medium text-gray-900 dark:text-white">
            Update Available
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            A new version is available. Refresh to get the latest features and fixes.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={update}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfflineIndicator
