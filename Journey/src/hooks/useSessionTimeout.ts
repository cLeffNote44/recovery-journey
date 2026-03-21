import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

/**
 * HIPAA-compliant session timeout hook
 *
 * Automatically logs out users after a period of inactivity.
 * HIPAA requires automatic logoff after a predetermined period of inactivity.
 * Standard recommendation is 15 minutes for healthcare applications.
 */

export interface SessionTimeoutConfig {
  /** Timeout duration in milliseconds (default: 15 minutes) */
  timeoutDuration?: number
  /** Warning duration before timeout in milliseconds (default: 2 minutes) */
  warningDuration?: number
  /** Events that reset the timer (default: mouse, keyboard, touch, scroll) */
  activityEvents?: string[]
  /** Callback when session times out */
  onTimeout?: () => void
  /** Callback when warning period starts */
  onWarning?: (remainingTime: number) => void
  /** Callback when activity is detected during warning */
  onWarningDismissed?: () => void
  /** Whether the hook is enabled (default: true when user is logged in) */
  enabled?: boolean
}

export interface SessionTimeoutState {
  /** Whether the warning is currently showing */
  isWarningVisible: boolean
  /** Remaining time in milliseconds until timeout */
  remainingTime: number
  /** Reset the session timer manually */
  resetTimer: () => void
  /** Immediately log out */
  logout: () => void
  /** Extend the session (dismiss warning and reset timer) */
  extendSession: () => void
}

const DEFAULT_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const DEFAULT_WARNING = 2 * 60 * 1000 // 2 minutes
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'wheel',
]

/**
 * Hook for managing session timeout with HIPAA compliance
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isWarningVisible, remainingTime, extendSession } = useSessionTimeout({
 *     timeoutDuration: 15 * 60 * 1000, // 15 minutes
 *     onWarning: (time) => console.log(`Session expires in ${time}ms`),
 *   })
 *
 *   return (
 *     <>
 *       {isWarningVisible && (
 *         <SessionWarningModal
 *           remainingTime={remainingTime}
 *           onExtend={extendSession}
 *         />
 *       )}
 *       <MainContent />
 *     </>
 *   )
 * }
 * ```
 */
export function useSessionTimeout(config: SessionTimeoutConfig = {}): SessionTimeoutState {
  const {
    timeoutDuration = DEFAULT_TIMEOUT,
    warningDuration = DEFAULT_WARNING,
    activityEvents = DEFAULT_EVENTS,
    onTimeout,
    onWarning,
    onWarningDismissed,
    enabled: enabledProp,
  } = config

  const { isAuthenticated, logout: storeLogout } = useAuthStore()

  // Default enabled when authenticated, unless explicitly set
  const enabled = enabledProp ?? isAuthenticated

  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeoutDuration)

  // Refs to hold timer IDs and last activity timestamp
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  /**
   * Clear all timers
   */
  const clearAllTimers = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  /**
   * Handle session timeout
   */
  const handleTimeout = useCallback(() => {
    clearAllTimers()
    setIsWarningVisible(false)

    // Call custom callback if provided
    onTimeout?.()

    // Perform logout with session_timeout reason for audit logging
    storeLogout('session_timeout')
  }, [clearAllTimers, onTimeout, storeLogout])

  /**
   * Start the countdown timer during warning period
   */
  const startCountdown = useCallback(() => {
    const warningStartTime = Date.now()

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - warningStartTime
      const remaining = Math.max(0, warningDuration - elapsed)
      setRemainingTime(remaining)

      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }
      }
    }, 1000)
  }, [warningDuration])

  /**
   * Show the warning dialog
   */
  const showWarning = useCallback(() => {
    setIsWarningVisible(true)
    setRemainingTime(warningDuration)

    // Call warning callback
    onWarning?.(warningDuration)

    // Start countdown
    startCountdown()

    // Set final timeout
    timeoutTimerRef.current = setTimeout(handleTimeout, warningDuration)
  }, [warningDuration, onWarning, startCountdown, handleTimeout])

  /**
   * Reset all timers and start fresh
   */
  const resetTimer = useCallback(() => {
    if (!enabled) return

    clearAllTimers()
    lastActivityRef.current = Date.now()
    setIsWarningVisible(false)
    setRemainingTime(timeoutDuration)

    // Set timer for when to show warning
    const warningTime = timeoutDuration - warningDuration
    warningTimerRef.current = setTimeout(showWarning, warningTime)
  }, [enabled, clearAllTimers, timeoutDuration, warningDuration, showWarning])

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    if (!enabled) return

    // Throttle activity detection to once per second
    const now = Date.now()
    if (now - lastActivityRef.current < 1000) return

    lastActivityRef.current = now

    // Only reset if warning is not visible
    // If warning is visible, user must explicitly extend session
    if (!isWarningVisible) {
      resetTimer()
    }
  }, [enabled, isWarningVisible, resetTimer])

  /**
   * Extend the session (dismiss warning)
   */
  const extendSession = useCallback(() => {
    setIsWarningVisible(false)
    onWarningDismissed?.()
    resetTimer()
  }, [onWarningDismissed, resetTimer])

  /**
   * Immediate logout
   */
  const logout = useCallback(() => {
    clearAllTimers()
    setIsWarningVisible(false)
    storeLogout()
  }, [clearAllTimers, storeLogout])

  // Set up activity listeners
  useEffect(() => {
    if (!enabled) {
      clearAllTimers()
      return
    }

    // Start the timer
    resetTimer()

    // Add activity listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Also listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // Check if we should have timed out while away
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed >= timeoutDuration) {
          handleTimeout()
        } else if (elapsed >= timeoutDuration - warningDuration) {
          showWarning()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      clearAllTimers()
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    enabled,
    activityEvents,
    handleActivity,
    resetTimer,
    clearAllTimers,
    handleTimeout,
    showWarning,
    timeoutDuration,
    warningDuration,
  ])

  return {
    isWarningVisible,
    remainingTime,
    resetTimer,
    logout,
    extendSession,
  }
}

/**
 * Format remaining time for display
 * @param ms - Remaining time in milliseconds
 * @returns Formatted string like "2:30" or "45 seconds"
 */
export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}
