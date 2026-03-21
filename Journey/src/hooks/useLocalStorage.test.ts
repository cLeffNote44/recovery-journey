import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, useSessionStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial value', () => {
    it('should return initial value when nothing is stored', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'default'))

      expect(result.current[0]).toBe('default')
    })

    it('should return stored value if it exists', () => {
      localStorage.setItem('testKey', JSON.stringify('stored value'))

      const { result } = renderHook(() => useLocalStorage('testKey', 'default'))

      expect(result.current[0]).toBe('stored value')
    })

    it('should handle complex objects', () => {
      const storedObject = { name: 'Test', items: [1, 2, 3] }
      localStorage.setItem('testKey', JSON.stringify(storedObject))

      const { result } = renderHook(() =>
        useLocalStorage('testKey', { name: '', items: [] })
      )

      expect(result.current[0]).toEqual(storedObject)
    })

    it('should return initial value on JSON parse error', () => {
      localStorage.setItem('testKey', 'invalid json{')

      const { result } = renderHook(() => useLocalStorage('testKey', 'default'))

      expect(result.current[0]).toBe('default')
    })
  })

  describe('setValue', () => {
    it('should update state and localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')
      expect(JSON.parse(localStorage.getItem('testKey') || '')).toBe('updated')
    })

    it('should accept a function updater', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0))

      act(() => {
        result.current[1]((prev) => prev + 1)
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1]((prev) => prev + 5)
      })

      expect(result.current[0]).toBe(6)
    })

    it('should handle setting objects', () => {
      const { result } = renderHook(() =>
        useLocalStorage<{ name: string }>('testKey', { name: 'initial' })
      )

      act(() => {
        result.current[1]({ name: 'updated' })
      })

      expect(result.current[0]).toEqual({ name: 'updated' })
      expect(JSON.parse(localStorage.getItem('testKey') || '')).toEqual({
        name: 'updated',
      })
    })
  })

  describe('removeValue', () => {
    it('should reset to initial value and remove from localStorage', () => {
      localStorage.setItem('testKey', JSON.stringify('stored'))

      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      expect(result.current[0]).toBe('stored')

      act(() => {
        result.current[2]()
      })

      expect(result.current[0]).toBe('initial')
      expect(localStorage.getItem('testKey')).toBe(null)
    })
  })

  describe('cross-tab synchronization', () => {
    it('should update when storage event fires with new value', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      act(() => {
        // Simulate storage event from another tab
        const event = new StorageEvent('storage', {
          key: 'testKey',
          newValue: JSON.stringify('from other tab'),
          oldValue: JSON.stringify('initial'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('from other tab')
    })

    it('should reset to initial when storage event has null value', () => {
      localStorage.setItem('testKey', JSON.stringify('stored'))

      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      expect(result.current[0]).toBe('stored')

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'testKey',
          newValue: null,
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('initial')
    })

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'otherKey',
          newValue: JSON.stringify('other value'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('updated')
    })

    it('should handle invalid JSON in storage event', () => {
      const { result } = renderHook(() => useLocalStorage('testKey', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'testKey',
          newValue: 'invalid json{',
        })
        window.dispatchEvent(event)
      })

      // Should keep the current value on parse error
      expect(result.current[0]).toBe('updated')
    })
  })

  describe('cleanup', () => {
    it('should remove storage event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useLocalStorage('testKey', 'initial'))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      )
    })
  })

  describe('different keys', () => {
    it('should maintain separate values for different keys', () => {
      const { result: result1 } = renderHook(() =>
        useLocalStorage('key1', 'default1')
      )
      const { result: result2 } = renderHook(() =>
        useLocalStorage('key2', 'default2')
      )

      act(() => {
        result1.current[1]('value1')
        result2.current[1]('value2')
      })

      expect(result1.current[0]).toBe('value1')
      expect(result2.current[0]).toBe('value2')
    })
  })
})

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('should return initial value when nothing is stored', () => {
    const { result } = renderHook(() => useSessionStorage('testKey', 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('should return stored value if it exists', () => {
    sessionStorage.setItem('testKey', JSON.stringify('stored value'))

    const { result } = renderHook(() => useSessionStorage('testKey', 'default'))

    expect(result.current[0]).toBe('stored value')
  })

  it('should update state and sessionStorage', () => {
    const { result } = renderHook(() =>
      useSessionStorage('testKey', 'initial')
    )

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(sessionStorage.getItem('testKey') || '')).toBe('updated')
  })

  it('should remove value from sessionStorage', () => {
    sessionStorage.setItem('testKey', JSON.stringify('stored'))

    const { result } = renderHook(() =>
      useSessionStorage('testKey', 'initial')
    )

    expect(result.current[0]).toBe('stored')

    act(() => {
      result.current[2]()
    })

    expect(result.current[0]).toBe('initial')
    expect(sessionStorage.getItem('testKey')).toBe(null)
  })

  it('should accept function updater', () => {
    const { result } = renderHook(() => useSessionStorage('count', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })
})
