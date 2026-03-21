import { useState } from 'react'
import { X } from 'lucide-react'
import {
  timeSlots,
  type AppointmentType,
  type RecurrencePattern,
} from '../../data/appointmentsData'

// =============================================================================
// TYPES
// =============================================================================

export interface AppointmentFormData {
  title: string
  patientId: string
  type: AppointmentType
  date: string
  startTime: string
  endTime: string
  location: string
  notes: string
  clinicianId: string
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
}

interface Patient {
  id: string
  name: string
}

interface Clinician {
  id: string
  name: string
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AppointmentFormData) => void
  patients: Patient[]
  clinicians: Clinician[]
  initialData?: Partial<AppointmentFormData>
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  patients,
  clinicians,
  initialData,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: initialData?.title || '',
    patientId: initialData?.patientId || '',
    type: initialData?.type || 'individual',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '10:00',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
    clinicianId: initialData?.clinicianId || '',
    isRecurring: initialData?.isRecurring || false,
    recurrencePattern: initialData?.recurrencePattern || 'none',
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit(formData)
    // Reset form
    setFormData({
      title: '',
      patientId: '',
      type: 'individual',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      notes: '',
      clinicianId: '',
      isRecurring: false,
      recurrencePattern: 'none',
    })
  }

  const isValid = formData.title && formData.patientId && formData.date

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="appointment-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            New Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="appointment-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="appointment-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Individual Therapy"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-required="true"
            />
          </div>

          {/* Patient & Clinician */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="appointment-patient"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                id="appointment-patient"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="appointment-clinician"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Clinician
              </label>
              <select
                id="appointment-clinician"
                value={formData.clinicianId}
                onChange={(e) => setFormData({ ...formData, clinicianId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select clinician</option>
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="appointment-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Type
            </label>
            <select
              id="appointment-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as AppointmentType })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="individual">Individual Therapy</option>
              <option value="group">Group Session</option>
              <option value="family">Family Session</option>
              <option value="telehealth">Telehealth</option>
              <option value="assessment">Assessment</option>
              <option value="medical">Medical Consultation</option>
              <option value="case-management">Case Management</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="appointment-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="appointment-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
              aria-required="true"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="appointment-start"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Start Time
              </label>
              <select
                id="appointment-start"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="appointment-end"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                End Time
              </label>
              <select
                id="appointment-end"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="appointment-location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Location
            </label>
            <input
              id="appointment-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Room 101 or Virtual"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="appointment-recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="appointment-recurring"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Recurring appointment
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label
                htmlFor="appointment-recurrence"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Recurrence Pattern
              </label>
              <select
                id="appointment-recurrence"
                value={formData.recurrencePattern}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrencePattern: e.target.value as RecurrencePattern,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              htmlFor="appointment-notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="appointment-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
