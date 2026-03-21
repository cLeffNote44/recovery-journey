import { X, User, Calendar, Clock, MapPin, Check, Repeat } from 'lucide-react'
import { programs, formatTime, type Appointment } from '../../data/appointmentsData'

// =============================================================================
// TYPES
// =============================================================================

interface AppointmentDetailModalProps {
  appointment: Appointment | null
  onClose: () => void
  onCancel: (appointmentId: string) => void
  onComplete: (appointmentId: string) => void
  getTypeIcon: (type: string) => React.ReactNode
  getTypeColor: (type: string, programId?: string) => string
}

// =============================================================================
// HELPERS
// =============================================================================

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'no-show': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}
      role="status"
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AppointmentDetailModal({
  appointment,
  onClose,
  onCancel,
  onComplete,
  getTypeIcon,
  getTypeColor,
}: AppointmentDetailModalProps) {
  if (!appointment) return null

  const program = appointment.programId
    ? programs.find((p) => p.id === appointment.programId)
    : null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="detail-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Appointment Type Header */}
        <div
          className={`p-4 rounded-lg border mb-4 ${getTypeColor(appointment.type, appointment.programId)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon(appointment.type)}
            <h3 className="font-semibold">{appointment.title}</h3>
            {appointment.isRecurring && (
              <Repeat className="w-4 h-4 opacity-60" aria-label="Recurring appointment" />
            )}
          </div>
          <p className="text-sm opacity-75">
            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Session
          </p>
          {program && <p className="text-xs opacity-60 mt-1">{program.name}</p>}
        </div>

        {/* Details List */}
        <dl className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <dt className="sr-only">Patient</dt>
            <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">Patient:</span>
            <dd className="font-medium text-gray-900 dark:text-white">
              {appointment.patientName}
            </dd>
          </div>

          {appointment.clinicianName && (
            <div className="flex items-center gap-3">
              <dt className="sr-only">Clinician</dt>
              <User className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span className="text-gray-600 dark:text-gray-400">Clinician:</span>
              <dd className="font-medium text-gray-900 dark:text-white">
                {appointment.clinicianName}
              </dd>
            </div>
          )}

          <div className="flex items-center gap-3">
            <dt className="sr-only">Date</dt>
            <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">Date:</span>
            <dd className="font-medium text-gray-900 dark:text-white">{appointment.date}</dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className="sr-only">Time</dt>
            <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">Time:</span>
            <dd className="font-medium text-gray-900 dark:text-white">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className="sr-only">Location</dt>
            <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">Location:</span>
            <dd className="font-medium text-gray-900 dark:text-white">
              {appointment.location}
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className="sr-only">Status</dt>
            <Check className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <dd>{getStatusBadge(appointment.status)}</dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onCancel(appointment.id)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
          >
            Cancel Appointment
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onComplete(appointment.id)}
              disabled={
                appointment.status === 'cancelled' || appointment.status === 'completed'
              }
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
