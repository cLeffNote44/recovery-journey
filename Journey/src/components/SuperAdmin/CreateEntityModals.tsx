import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCreateAdministrator, useCreateClinician } from '../../hooks'
import { patientsAPI } from '../../services/api'
import { queryKeys } from '../../lib/queryClient'
import { showToast } from '../Toast'

interface FacilityOption {
  id: string
  name: string
}

interface BaseProps {
  isOpen: boolean
  onClose: () => void
  facilities: FacilityOption[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

function ModalShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-6">{footer}</div>
      </div>
    </div>
  )
}

// ── Staff (Administrator / Clinician) ────────────────────────────────────────

const emptyStaff = { firstName: '', lastName: '', email: '', facilityId: '', tempPassword: '' }

function StaffCreateModal({
  isOpen,
  onClose,
  facilities,
  kind,
}: BaseProps & { kind: 'administrator' | 'clinician' }) {
  const [form, setForm] = useState(emptyStaff)
  const createAdministrator = useCreateAdministrator()
  const createClinician = useCreateClinician()
  const mutation = kind === 'administrator' ? createAdministrator : createClinician

  useEffect(() => {
    if (isOpen) setForm(emptyStaff)
  }, [isOpen])

  if (!isOpen) return null

  const label = kind === 'administrator' ? 'Administrator' : 'Clinician'
  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    EMAIL_RE.test(form.email) &&
    form.facilityId &&
    form.tempPassword.length >= 8

  const submit = () => {
    if (!valid || mutation.isPending) return
    mutation.mutate(
      {
        facility_id: form.facilityId,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        temp_password: form.tempPassword,
      },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <ModalShell
      title={`Add ${label}`}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid || mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Adding…' : `Add ${label}`}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="staff-first">First Name</label>
          <input id="staff-first" type="text" className={inputClass} value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="staff-last">Last Name</label>
          <input id="staff-last" type="text" className={inputClass} value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="staff-email">Email</label>
        <input id="staff-email" type="email" className={inputClass} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className={labelClass} htmlFor="staff-facility">Facility</label>
        <select id="staff-facility" className={inputClass} value={form.facilityId}
          onChange={(e) => setForm({ ...form, facilityId: e.target.value })}>
          <option value="">Select a facility</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="staff-password">Temporary Password</label>
        <input id="staff-password" type="password" className={inputClass} value={form.tempPassword}
          onChange={(e) => setForm({ ...form, tempPassword: e.target.value })} placeholder="Min. 8 characters" />
      </div>
    </ModalShell>
  )
}

export function AddAdministratorModal(props: BaseProps) {
  return <StaffCreateModal {...props} kind="administrator" />
}

export function AddClinicianModal(props: BaseProps) {
  return <StaffCreateModal {...props} kind="clinician" />
}

// ── Patient ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0]
const emptyPatient = () => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  facilityId: '',
  admissionDate: today(),
  sobrietyDate: today(),
})

/** Convert a YYYY-MM-DD value to an ISO datetime the backend accepts. */
function toIso(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

export function AddPatientModal({ isOpen, onClose, facilities }: BaseProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyPatient())

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await patientsAPI.create({
        facilityId: form.facilityId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: toIso(form.dateOfBirth),
        admissionDate: toIso(form.admissionDate),
        sobrietyDate: toIso(form.sobrietyDate),
      })
      if (response.success) return response
      throw new Error(response.error || 'Failed to create patient')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.patients() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
      showToast.success('Patient created successfully!')
      onClose()
    },
    onError: (error: Error) => showToast.error(error.message),
  })

  useEffect(() => {
    if (isOpen) setForm(emptyPatient())
  }, [isOpen])

  if (!isOpen) return null

  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.dateOfBirth &&
    form.facilityId &&
    form.admissionDate &&
    form.sobrietyDate

  return (
    <ModalShell
      title="Add Patient"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (valid && !mutation.isPending) mutation.mutate() }}
            disabled={!valid || mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Adding…' : 'Add Patient'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="patient-first">First Name</label>
          <input id="patient-first" type="text" className={inputClass} value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="patient-last">Last Name</label>
          <input id="patient-last" type="text" className={inputClass} value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="patient-dob">Date of Birth</label>
        <input id="patient-dob" type="date" className={inputClass} value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
      </div>
      <div>
        <label className={labelClass} htmlFor="patient-facility">Facility</label>
        <select id="patient-facility" className={inputClass} value={form.facilityId}
          onChange={(e) => setForm({ ...form, facilityId: e.target.value })}>
          <option value="">Select a facility</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="patient-admission">Admission Date</label>
          <input id="patient-admission" type="date" className={inputClass} value={form.admissionDate}
            onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass} htmlFor="patient-sobriety">Sobriety Date</label>
          <input id="patient-sobriety" type="date" className={inputClass} value={form.sobrietyDate}
            onChange={(e) => setForm({ ...form, sobrietyDate: e.target.value })} />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        A counselor can be assigned from the patient&apos;s profile after creation.
      </p>
    </ModalShell>
  )
}
