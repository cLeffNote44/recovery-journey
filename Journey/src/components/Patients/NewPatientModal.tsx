import { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'
import { patientFormSchema, validateForm, type PatientFormData } from '../../validation/schemas'
import { showToast } from '../Toast'

// ============================================================================
// NEW PATIENT MODAL COMPONENT
// ============================================================================

export interface NewPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PatientFormData) => Promise<void>
  newPatientKey: string | null
  onCopyKey: () => void
  copiedKey: boolean
}

export function NewPatientModal({
  isOpen,
  onClose,
  onSubmit,
  newPatientKey,
  onCopyKey,
  copiedKey,
}: NewPatientModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-patient-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2
            id="new-patient-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {newPatientKey ? 'Patient Created!' : 'Add New Patient'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {newPatientKey ? (
          <RegistrationKeySuccess
            registrationKey={newPatientKey}
            onCopy={onCopyKey}
            copied={copiedKey}
            onClose={onClose}
          />
        ) : (
          <NewPatientForm onSubmit={onSubmit} onCancel={onClose} />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// REGISTRATION KEY SUCCESS COMPONENT
// ============================================================================

interface RegistrationKeySuccessProps {
  registrationKey: string
  onCopy: () => void
  copied: boolean
  onClose: () => void
}

export function RegistrationKeySuccess({
  registrationKey,
  onCopy,
  copied,
  onClose,
}: RegistrationKeySuccessProps) {
  return (
    <div className="p-6 text-center" role="status" aria-live="polite">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Registration Key Generated
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Give this key to the patient to register on the mobile app.
      </p>

      <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 mb-6">
        <p
          className="text-3xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider"
          aria-label={`Registration key: ${registrationKey.split('').join(' ')}`}
        >
          {registrationKey}
        </p>
        <p className="text-xs text-gray-400 mt-2">Expires in 48 hours</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCopy}
          aria-live="polite"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              Copy Key
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// NEW PATIENT FORM COMPONENT
// ============================================================================

interface NewPatientFormProps {
  onSubmit: (data: PatientFormData) => Promise<void>
  onCancel: () => void
}

export function NewPatientForm({ onSubmit, onCancel }: NewPatientFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    sobriety_date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const result = validateForm(patientFormSchema, formData)
    if (!result.success) {
      setErrors(result.errors || {})
      showToast.error('Please fix the errors in the form.')
      return
    }

    setErrors({})
    setIsLoading(true)
    try {
      await onSubmit(result.data!)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4" aria-label="New patient form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="patient-first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="patient-first-name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first-name-error' : undefined}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
              errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.first_name && (
            <p id="first-name-error" className="mt-1 text-xs text-red-500" role="alert">{errors.first_name}</p>
          )}
        </div>
        <div>
          <label htmlFor="patient-last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="patient-last-name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last-name-error' : undefined}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
              errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.last_name && (
            <p id="last-name-error" className="mt-1 text-xs text-red-500" role="alert">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="patient-dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date of Birth <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="patient-dob"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleChange('date_of_birth', e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.date_of_birth}
          aria-describedby={errors.date_of_birth ? 'dob-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
            errors.date_of_birth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.date_of_birth && (
          <p id="dob-error" className="mt-1 text-xs text-red-500" role="alert">{errors.date_of_birth}</p>
        )}
      </div>

      <div>
        <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone
        </label>
        <input
          id="patient-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
            errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-xs text-red-500" role="alert">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="patient-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          id="patient-email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="patient@email.com"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="patient-sobriety-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sobriety Date <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="patient-sobriety-date"
          type="date"
          value={formData.sobriety_date}
          onChange={(e) => handleChange('sobriety_date', e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.sobriety_date}
          aria-describedby={errors.sobriety_date ? 'sobriety-date-error' : undefined}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
            errors.sobriety_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.sobriety_date && (
          <p id="sobriety-date-error" className="mt-1 text-xs text-red-500" role="alert">{errors.sobriety_date}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Patient'
          )}
        </button>
      </div>
    </form>
  )
}
