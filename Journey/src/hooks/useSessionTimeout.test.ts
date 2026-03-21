import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimeout, formatRemainingTime } from './useSessionTimeout'

// Mock the auth store
const mockLogout = vi.fn()
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    logout: mockLogout,
  }),
}))

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should start with warning not visible', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(result.current.isWarningVisible).toBe(false)
    })

    it('should initialize remainingTime to timeout duration', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(result.current.remainingTime).toBe(60000)
    })
  })

  describe('warning behavior', () => {
    it('should start with warning not visible', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000, // 1 minute
          warningDuration: 10000, // 10 seconds
        })
      )

      expect(result.current.isWarningVisible).toBe(false)
    })

    it('should provide extendSession function', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(typeof result.current.extendSession).toBe('function')
    })
  })

  describe('timeout behavior', () => {
    it('should provide logout function', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(typeof result.current.logout).toBe('function')
    })

    it('should call store logout when logout is called', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      act(() => {
        result.current.logout()
      })

      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('extendSession', () => {
    it('should provide extendSession function', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(typeof result.current.extendSession).toBe('function')
    })

    it('should reset remainingTime when extendSession is called', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      // Call extendSession
      act(() => {
        result.current.extendSession()
      })

      // Should reset to full timeout
      expect(result.current.remainingTime).toBe(60000)
    })
  })

  describe('manual logout', () => {
    it('should call store logout immediately', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      act(() => {
        result.current.logout()
      })

      expect(mockLogout).toHaveBeenCalled()
    })

    it('should hide warning when logout is called', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      act(() => {
        result.current.logout()
      })

      expect(result.current.isWarningVisible).toBe(false)
    })
  })

  describe('resetTimer', () => {
    it('should provide resetTimer function', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      expect(typeof result.current.resetTimer).toBe('function')
    })

    it('should reset remainingTime when resetTimer is called', () => {
      const { result } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      act(() => {
        result.current.resetTimer()
      })

      expect(result.current.remainingTime).toBe(60000)
    })
  })

  describe('activity detection', () => {
    it('should add event listeners when enabled', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
        })
      )

      // Should have added mousedown listener
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function),
        expect.any(Object)
      )

      addEventListenerSpy.mockRestore()
    })
  })

  describe('enabled flag', () => {
    it('should not set timers when disabled', () => {
      const onWarning = vi.fn()

      renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
          onWarning,
          enabled: false,
        })
      )

      // Advance past warning time
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      expect(onWarning).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should clear timers on unmount', () => {
      const onTimeout = vi.fn()

      const { unmount } = renderHook(() =>
        useSessionTimeout({
          timeoutDuration: 60000,
          warningDuration: 10000,
          onTimeout,
        })
      )

      // Unmount before timeout
      unmount()

      // Advance past timeout
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Should not be called since component unmounted
      expect(onTimeout).not.toHaveBeenCalled()
    })
  })
})

describe('formatRemainingTime', () => {
  it('should format minutes and seconds correctly', () => {
    expect(formatRemainingTime(120000)).toBe('2:00')
    expect(formatRemainingTime(90000)).toBe('1:30')
    expect(formatRemainingTime(65000)).toBe('1:05')
    expect(formatRemainingTime(61000)).toBe('1:01') // 61 seconds = 1 min 1 sec
    expect(formatRemainingTime(61500)).toBe('1:02') // 61.5s rounds up to 62s = 1:02
  })

  it('should format seconds only when under a minute', () => {
    expect(formatRemainingTime(45000)).toBe('45 seconds')
    expect(formatRemainingTime(30000)).toBe('30 seconds')
    expect(formatRemainingTime(1000)).toBe('1 second')
    expect(formatRemainingTime(500)).toBe('1 second') // Rounds up
  })

  it('should handle edge cases', () => {
    expect(formatRemainingTime(0)).toBe('0 seconds')
    expect(formatRemainingTime(59999)).toBe('1:00') // Rounds up to 60 seconds = 1 minute
  })
})
