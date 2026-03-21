import { useState, useEffect, useCallback } from 'react'

/**
 * Service Worker Management Hook
 *
 * Provides offline support capabilities:
 * - Registers and updates service worker
 * - Monitors online/offline status
 * - Manages request queue for offline mutations
 * - Handles background sync
 */

export interface QueuedRequest {
  url: string
  method: string
  timestamp: number
}

export interface ServiceWorkerState {
  /** Whether the service worker is registered */
  isRegistered: boolean
  /** Whether the service worker is ready */
  isReady: boolean
  /** Whether an update is available */
  hasUpdate: boolean
  /** Current online/offline status */
  isOnline: boolean
  /** Number of queued requests */
  queuedRequestCount: number
  /** List of queued requests */
  queuedRequests: QueuedRequest[]
  /** Whether background sync is supported */
  supportsSyncSync: boolean
  /** Registration error if any */
  error: Error | null
}

export interface ServiceWorkerActions {
  /** Update to new service worker version */
  update: () => void
  /** Force sync queued requests */
  forceSync: () => void
  /** Clear all caches */
  clearCache: () => void
  /** Get current queue status */
  refreshQueueStatus: () => void
}

export type UseServiceWorkerReturn = ServiceWorkerState & ServiceWorkerActions

/**
 * Hook for managing service worker and offline capabilities
 *
 * @example
 * ```tsx
 * function App() {
 *   const {
 *     isOnline,
 *     queuedRequestCount,
 *     hasUpdate,
 *     update,
 *     forceSync,
 *   } = useServiceWorker()
 *
 *   return (
 *     <>
 *       {!isOnline && <OfflineBanner queuedCount={queuedRequestCount} />}
 *       {hasUpdate && <UpdatePrompt onUpdate={update} />}
 *       <MainContent />
 *     </>
 *   )
 * }
 * ```
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isReady: false,
    hasUpdate: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    queuedRequestCount: 0,
    queuedRequests: [],
    supportsSyncSync: 'SyncManager' in window,
    error: null,
  })

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW Hook] Service workers not supported')
      return
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        setRegistration(reg)
        setState((prev) => ({
          ...prev,
          isRegistered: true,
          isReady: !!reg.active,
          error: null,
        }))

        console.log('[SW Hook] Service worker registered')

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState((prev) => ({ ...prev, hasUpdate: true }))
              }
            })
          }
        })

        // Ready state
        await navigator.serviceWorker.ready
        setState((prev) => ({ ...prev, isReady: true }))

        // Initial queue status
        refreshQueueStatus()
      } catch (error) {
        console.error('[SW Hook] Registration failed:', error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Registration failed'),
        }))
      }
    }

    register()
  }, [])

  // Listen for messages from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      const { type, ...data } = event.data || {}

      switch (type) {
        case 'QUEUE_STATUS':
          setState((prev) => ({
            ...prev,
            queuedRequestCount: data.count,
            queuedRequests: data.requests,
          }))
          break

        case 'SYNC_COMPLETE':
          console.log('[SW Hook] Sync complete:', data.results)
          refreshQueueStatus()
          break

        case 'CACHE_CLEARED':
          console.log('[SW Hook] Cache cleared')
          break

        default:
          break
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
      // Trigger sync when coming back online
      forceSync()
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Action: Update service worker
  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  // Action: Force sync queued requests
  const forceSync = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_SYNC' })
    }

    // Also try to trigger background sync if supported
    if (registration && 'sync' in registration) {
      (registration as any).sync.register('sync-requests').catch(console.error)
    }
  }, [registration])

  // Action: Clear cache
  const clearCache = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
    }
  }, [])

  // Action: Refresh queue status
  const refreshQueueStatus = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'GET_QUEUE_STATUS' })
    }
  }, [])

  return {
    ...state,
    update,
    forceSync,
    clearCache,
    refreshQueueStatus,
  }
}

/**
 * Simple hook for just online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
