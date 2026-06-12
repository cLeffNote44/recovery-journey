import { useState } from 'react'
import { X, Clock, CalendarDays } from 'lucide-react'
import { programs, dayNames, formatTime, type Program } from '../../data/appointmentsData'

// =============================================================================
// TYPES
// =============================================================================

export interface ProgramAssignmentData {
  patientId: string
  programId: string
  startDate: string
}

interface Patient {
  id: string
  name: string
}

interface ProgramAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProgramAssignmentData) => void
  patients: Patient[]
  /** Patient IDs that already have active program assignments */
  excludePatientIds?: string[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProgramAssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  patients,
  excludePatientIds = [],
}: ProgramAssignmentModalProps) {
  const [formData, setFormData] = useState<ProgramAssignmentData>({
    patientId: '',
    programId: '',
    startDate: '',
  })

  if (!isOpen) return null

  const availablePatients = patients.filter((p) => !excludePatientIds.includes(p.id))
  const selectedProgram = programs.find((p) => p.id === formData.programId)
  const isValid = formData.patientId && formData.programId && formData.startDate

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({ patientId: '', programId: '', startDate: '' })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="program-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Assign Program to Patient
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Assigning a program will automatically schedule recurring sessions based on the
          program&apos;s template.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Patient */}
          <div>
            <label
              htmlFor="program-patient"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              id="program-patient"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
              aria-required="true"
            >
              <option value="">Select patient</option>
              {availablePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {availablePatients.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                All patients are already enrolled in active programs.
              </p>
            )}
          </div>

          {/* Program */}
          <div>
            <label
              htmlFor="program-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Program <span className="text-red-500">*</span>
            </label>
            <select
              id="program-type"
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
              aria-required="true"
            >
              <option value="">Select program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Details Preview */}
          {selectedProgram && (
            <div
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
              aria-live="polite"
            >
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                Program Details:
              </p>
              <p className="text-gray-600 dark:text-gray-400">{selectedProgram.description}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>
                  {formatTime(selectedProgram.schedule.startTime)} -{' '}
                  {formatTime(selectedProgram.schedule.endTime)}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" aria-hidden="true" />
                <span>{selectedProgram.schedule.days.map((d) => dayNames[d]).join(', ')}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">Sessions:</span>{' '}
                {selectedProgram.sessions.join(', ')}
              </p>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label
              htmlFor="program-start"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="program-start"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
              aria-required="true"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Assign Program
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { programs, type Program }
