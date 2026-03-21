import { useEffect, useCallback, useRef, useState } from 'react'
import { useBlocker, type BlockerFunction } from 'react-router-dom'

/**
 * Hook for preventing accidental data loss when navigating away from forms
 * with unsaved changes.
 *
 * This hook handles two scenarios:
 * 1. Browser/tab close/refresh (beforeunload event)
 * 2. In-app navigation via React Router (useBlocker)
 *
 * IMPORTANT: The beforeunload prompt cannot be customized in modern browsers
 * for security reasons. Browsers show their own generic message.
 */

export interface UnsavedChangesConfig {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean
  /** Custom message for in-app navigation (not shown in browser close) */
  message?: string
  /** Callback before navigation is blocked */
  onBlocked?: () => void
  /** Whether to enable the hook (default: true) */
  enabled?: boolean
}

export interface UnsavedChangesState {
  /** Whether navigation is currently blocked */
  isBlocked: boolean
  /** Proceed with blocked navigation */
  proceed: () => void
  /** Cancel blocked navigation and stay */
  reset: () => void
  /** The custom message being shown */
  message: string
}

const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave?'

/**
 * Hook for warning users about unsaved changes before navigation
 *
 * @example
 * ```tsx
 * function EditPatientForm() {
 *   const [formData, setFormData] = useState(initialData)
 *   const [savedData, setSavedData] = useState(initialData)
 *
 *   const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedData)
 *
 *   const { isBlocked, proceed, reset, message } = useUnsavedChanges({
 *     hasUnsavedChanges: hasChanges,
 *     message: 'Your patient updates will be lost. Continue?',
 *   })
 *
 *   return (
 *     <>
 *       <form>...</form>
 *       {isBlocked && (
 *         <ConfirmDialog
 *           message={message}
 *           onConfirm={proceed}
 *           onCancel={reset}
 *         />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export function useUnsavedChanges(config: UnsavedChangesConfig): UnsavedChangesState {
  const {
    hasUnsavedChanges,
    message = DEFAULT_MESSAGE,
    onBlocked,
    enabled = true,
  } = config

  const shouldBlock = enabled && hasUnsavedChanges

  // Handle browser/tab close with beforeunload
  useEffect(() => {
    if (!shouldBlock) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to trigger the browser's built-in prompt
      e.preventDefault()
      // For older browsers
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldBlock, message])

  // Handle in-app navigation with React Router's useBlocker
  const blocker = useBlocker(
    useCallback<BlockerFunction>(
      ({ currentLocation, nextLocation }) => {
        // Only block if locations are different and we have unsaved changes
        return shouldBlock && currentLocation.pathname !== nextLocation.pathname
      },
      [shouldBlock]
    )
  )

  // Call onBlocked when navigation is blocked
  useEffect(() => {
    if (blocker.state === 'blocked') {
      onBlocked?.()
    }
  }, [blocker.state, onBlocked])

  const proceed = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }, [blocker])

  const reset = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  return {
    isBlocked: blocker.state === 'blocked',
    proceed,
    reset,
    message,
  }
}

/**
 * Simple hook for just the beforeunload warning without React Router integration
 *
 * Use this when you only need browser close/refresh warnings without
 * blocking in-app navigation.
 *
 * @example
 * ```tsx
 * function SimpleForm() {
 *   const [isDirty, setIsDirty] = useState(false)
 *   useBeforeUnload(isDirty)
 *
 *   return <form onChange={() => setIsDirty(true)}>...</form>
 * }
 * ```
 */
export function useBeforeUnload(
  hasUnsavedChanges: boolean,
  message: string = DEFAULT_MESSAGE
) {
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])
}

/**
 * Hook to track form dirty state by comparing current and initial values
 *
 * @example
 * ```tsx
 * function PatientForm({ patient }) {
 *   const [formData, setFormData] = useState(patient)
 *   const { isDirty, resetDirtyState } = useFormDirtyState(patient, formData)
 *
 *   const handleSave = async () => {
 *     await savePatient(formData)
 *     resetDirtyState() // After successful save
 *   }
 *
 *   return (
 *     <>
 *       <form>...</form>
 *       <button disabled={!isDirty}>Save</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useFormDirtyState<T>(initialValue: T, currentValue: T) {
  const savedValueRef = useRef<T>(initialValue)
  const [isDirty, setIsDirty] = useState(false)

  // Compare current value to saved value
  useEffect(() => {
    const currentJson = JSON.stringify(currentValue)
    const savedJson = JSON.stringify(savedValueRef.current)
    setIsDirty(currentJson !== savedJson)
  }, [currentValue])

  // Reset the "saved" state (call after successful save)
  const resetDirtyState = useCallback((newSavedValue?: T) => {
    if (newSavedValue !== undefined) {
      savedValueRef.current = newSavedValue
    } else {
      savedValueRef.current = currentValue as T
    }
    setIsDirty(false)
  }, [currentValue])

  // Update saved value when initial value changes (e.g., data loaded from server)
  useEffect(() => {
    savedValueRef.current = initialValue
    setIsDirty(false)
  }, [initialValue])

  return {
    isDirty,
    resetDirtyState,
  }
}
