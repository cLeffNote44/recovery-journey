import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBeforeUnload, useFormDirtyState } from './useUnsavedChanges'

// Note: useUnsavedChanges with useBlocker requires more complex setup
// due to React Router's navigation blocking behavior.
// These tests focus on the utility hooks that can be tested independently.

describe('useBeforeUnload', () => {
  let addEventListenerSpy: MockInstance
  let removeEventListenerSpy: MockInstance

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    vi.clearAllMocks()
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should add beforeunload listener when hasUnsavedChanges is true', () => {
    renderHook(() => useBeforeUnload(true))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should not add listener when hasUnsavedChanges is false', () => {
    renderHook(() => useBeforeUnload(false))

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should remove listener when hasUnsavedChanges changes to false', () => {
    const { rerender } = renderHook(({ dirty }) => useBeforeUnload(dirty), {
      initialProps: { dirty: true },
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )

    rerender({ dirty: false })

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should remove listener on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnload(true))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    )
  })

  it('should set returnValue on beforeunload event', () => {
    renderHook(() => useBeforeUnload(true, 'Custom message'))

    // Get the handler that was registered
    const handler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'beforeunload'
    )?.[1] as EventListener

    expect(handler).toBeDefined()

    // Create a mock event
    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as unknown as BeforeUnloadEvent

    // Call the handler
    const result = handler(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(mockEvent.returnValue).toBe('Custom message')
    expect(result).toBe('Custom message')
  })
})

describe('useFormDirtyState', () => {
  it('should start with isDirty as false', () => {
    const initialValue = { name: 'John' }
    const currentValue = { name: 'John' }

    const { result } = renderHook(() =>
      useFormDirtyState(initialValue, currentValue)
    )

    expect(result.current.isDirty).toBe(false)
  })

  it('should detect dirty state when values differ', () => {
    const initialValue = { name: 'John' }
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      { initialProps: { current: { name: 'John' } } }
    )

    expect(result.current.isDirty).toBe(false)

    rerender({ current: { name: 'Jane' } })

    expect(result.current.isDirty).toBe(true)
  })

  it('should reset dirty state when values match again', () => {
    const initialValue = { name: 'John' }
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      { initialProps: { current: { name: 'John' } } }
    )

    rerender({ current: { name: 'Jane' } })
    expect(result.current.isDirty).toBe(true)

    rerender({ current: { name: 'John' } })
    expect(result.current.isDirty).toBe(false)
  })

  it('should handle nested objects', () => {
    const initialValue = { user: { name: 'John', age: 30 } }
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      { initialProps: { current: { user: { name: 'John', age: 30 } } } }
    )

    expect(result.current.isDirty).toBe(false)

    rerender({ current: { user: { name: 'John', age: 31 } } })
    expect(result.current.isDirty).toBe(true)
  })

  it('should handle arrays', () => {
    const initialValue = [1, 2, 3]
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      { initialProps: { current: [1, 2, 3] } }
    )

    expect(result.current.isDirty).toBe(false)

    rerender({ current: [1, 2, 3, 4] })
    expect(result.current.isDirty).toBe(true)
  })

  it('should reset dirty state when resetDirtyState is called', () => {
    const initialValue = { name: 'John' }
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      { initialProps: { current: { name: 'John' } } }
    )

    rerender({ current: { name: 'Jane' } })
    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.resetDirtyState()
    })

    expect(result.current.isDirty).toBe(false)
  })

  it('should work with resetDirtyState', () => {
    const { result } = renderHook(
      ({ initial, current }) => useFormDirtyState(initial, current),
      { initialProps: { initial: { name: 'John' }, current: { name: 'Jane' } } }
    )

    // isDirty starts as true because initial and current differ
    // (after effects settle)
    // The actual dirty tracking happens internally via effects

    // Test that resetDirtyState is a function and can be called
    expect(typeof result.current.resetDirtyState).toBe('function')

    // Reset with new saved value
    act(() => {
      result.current.resetDirtyState({ name: 'Jane' })
    })

    // After reset with matching value, should be clean
    expect(result.current.isDirty).toBe(false)
  })

  it('should track dirty state when initial is stable and current diverges', () => {
    // Use a stable reference for initialValue like real React components would
    const initialValue = { name: 'John' }

    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState(initialValue, current),
      {
        initialProps: {
          current: { name: 'John' },
        },
      }
    )

    // Start clean - initial and current match
    expect(result.current.isDirty).toBe(false)

    // Change only current, initial stays stable
    rerender({ current: { name: 'Jane' } })

    // Should be dirty now
    expect(result.current.isDirty).toBe(true)
  })

  it('should handle primitive values', () => {
    const { result, rerender } = renderHook(
      ({ current }) => useFormDirtyState('initial', current),
      { initialProps: { current: 'initial' } }
    )

    expect(result.current.isDirty).toBe(false)

    rerender({ current: 'changed' })
    expect(result.current.isDirty).toBe(true)

    rerender({ current: 'initial' })
    expect(result.current.isDirty).toBe(false)
  })
})
