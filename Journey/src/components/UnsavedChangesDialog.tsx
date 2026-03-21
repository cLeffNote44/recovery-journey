import { AlertTriangle, X } from 'lucide-react'

interface UnsavedChangesDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean
  /** The message to display */
  message?: string
  /** Called when user confirms leaving */
  onConfirm: () => void
  /** Called when user cancels and stays */
  onCancel: () => void
  /** Title of the dialog */
  title?: string
  /** Label for confirm button */
  confirmLabel?: string
  /** Label for cancel button */
  cancelLabel?: string
}

/**
 * A dialog that warns users about unsaved changes before navigation.
 *
 * Used in conjunction with the useUnsavedChanges hook to provide
 * a customizable in-app navigation warning.
 */
export function UnsavedChangesDialog({
  isOpen,
  message = 'You have unsaved changes that will be lost if you leave this page.',
  onConfirm,
  onCancel,
  title = 'Unsaved Changes',
  confirmLabel = 'Leave Page',
  cancelLabel = 'Stay on Page',
}: UnsavedChangesDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
              <h2
                id="unsaved-changes-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p
              id="unsaved-changes-description"
              className="text-gray-600"
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              autoFocus
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default UnsavedChangesDialog
