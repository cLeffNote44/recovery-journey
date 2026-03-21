import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('should debounce value updates', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Update the value
    rerender({ value: 'updated' })

    // Value should still be initial immediately after update
    expect(result.current).toBe('initial')

    // Advance time by 200ms (less than delay)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('initial')

    // Advance time to complete the delay
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    // Rapid updates
    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'abc' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'abcd' })

    // Still shows initial value
    expect(result.current).toBe('a')

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should show the latest value
    expect(result.current).toBe('abcd')
  })

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('updated')
  })

  it('should use default delay of 300ms', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should work with different types', async () => {
    // Number
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )
    rerenderNumber({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(numberResult.current).toBe(42)

    // Object
    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { count: 0 } } }
    )
    rerenderObject({ value: { count: 5 } })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(objectResult.current).toEqual({ count: 5 })
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce callback execution', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    // Call the debounced function multiple times within act
    act(() => {
      result.current('arg1')
      result.current('arg2')
      result.current('arg3')
    })

    // Callback shouldn't have been called yet
    expect(callback).not.toHaveBeenCalled()

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Callback should have been called once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg3')
  })

  it('should cancel previous timer on rapid calls', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    act(() => {
      result.current('first')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    act(() => {
      result.current('second')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    act(() => {
      result.current('third')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('third')
  })

  it('should pass multiple arguments to callback', async () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 100))

    act(() => {
      result.current('arg1', 'arg2', 123)
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should maintain stable function reference', () => {
    const callback = vi.fn()
    const { result, rerender } = renderHook(() =>
      useDebouncedCallback(callback, 300)
    )

    const firstRef = result.current
    rerender()
    const secondRef = result.current

    // With useCallback, the reference should be stable
    expect(firstRef).toBe(secondRef)
  })
})
