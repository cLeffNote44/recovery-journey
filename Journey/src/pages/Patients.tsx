import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { patientsAPI } from '../services/api'
import { mockPatients, type MockPatient } from '../data/mockData'
import { type PatientFormData } from '../validation/schemas'
import { showToast } from '../components/Toast'
import {
  PatientTableSkeleton,
  LoadingWrapper,
} from '../components/LoadingState'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { NewPatientModal } from '../components/Patients'
import { auditLog } from '../services/auditLog'
import { useDebounce } from '../hooks'

export default function Patients() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewPatientModal, setShowNewPatientModal] = useState(searchParams.get('new') === 'true')
  const [newPatientKey, setNewPatientKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [patients, setPatients] = useState<MockPatient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const hasLoggedListView = useRef(false)

  // Debounce search for audit logging
  const debouncedSearch = useDebounce(search, 500)

  // Map API camelCase patient to MockPatient snake_case shape
  const mapApiPatient = (p: Record<string, unknown>): MockPatient => ({
    id: p.id as string,
    first_name: (p.firstName || p.first_name || '') as string,
    last_name: (p.lastName || p.last_name || '') as string,
    status: ((p.status as string) || 'active').toLowerCase() as 'active' | 'pending' | 'discharged',
    days_sober: (p.daysSober || p.days_sober || 0) as number,
    check_in_streak: (p.checkInStreak || p.check_in_streak || 0) as number,
    admission_date: (p.admissionDate || p.admission_date || '') as string,
    counselor_name: p.assignedCounselor
      ? `${(p.assignedCounselor as { firstName?: string }).firstName || ''} ${(p.assignedCounselor as { lastName?: string }).lastName || ''}`.trim()
      : (p.counselor_name || '') as string,
    registration_key: (p.registrationKey || p.registration_key) as string | undefined,
  })

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await patientsAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
        if (response.success && response.patients) {
          setPatients(response.patients.map((p: Record<string, unknown>) => mapApiPatient(p)))
          setIsUsingMockData(false)

          // Log patient list view (once per session)
          if (!hasLoggedListView.current) {
            auditLog.patientListView({ status: statusFilter })
            hasLoggedListView.current = true
          }
        }
      } catch {
        // API unavailable - use mock data
        setPatients(mockPatients)
        setIsUsingMockData(true)

        // Still log the view even with mock data
        if (!hasLoggedListView.current) {
          auditLog.patientListView({ status: statusFilter, mockData: true })
          hasLoggedListView.current = true
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatients()
  }, [statusFilter])

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Audit log patient searches (debounced to avoid excessive logging)
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      auditLog.patientSearch(debouncedSearch, filteredPatients.length)
    }
  }, [debouncedSearch, filteredPatients.length])

  const handleCreatePatient = async (formData: PatientFormData) => {
    try {
      const response = await patientsAPI.create({
        facilityId: 'current-facility-id', // Would come from auth context
        firstName: formData.first_name,
        lastName: formData.last_name,
        dateOfBirth: formData.date_of_birth,
        sobrietyDate: formData.sobriety_date,
        phone: formData.phone,
        email: formData.email,
      })
      if (response.success && response.registration_key) {
        setNewPatientKey(response.registration_key)
        showToast.success('Patient created successfully!')

        // Audit log patient creation
        if (response.patient_id) {
          auditLog.patientCreate(response.patient_id)
        }

        // Refresh patient list
        const updated = await patientsAPI.getAll({})
        if (updated.success) setPatients(updated.patients)
        return
      }
    } catch {
      showToast.warning('Could not connect to server. Using demo mode.')
    }

    // Fallback mock key for demo mode
    const generatedKey = 'REC' + Math.random().toString(36).substring(2, 3).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    setNewPatientKey(generatedKey)

    // Log demo mode patient creation
    auditLog.patientCreate(`demo-${generatedKey}`)
  }

  const copyKey = () => {
    if (newPatientKey) {
      navigator.clipboard.writeText(newPatientKey)
      setCopiedKey(true)
      showToast.success('Registration key copied to clipboard!')
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Re-trigger fetch
    const fetchPatients = async () => {
      try {
        const response = await patientsAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
        if (response.success && response.patients) {
          setPatients(response.patients)
          setIsUsingMockData(false)
        }
      } catch (err) {
        setPatients(mockPatients)
        setIsUsingMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatients()
  }

  return (
    <SectionErrorBoundary>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor your patients</p>
          </div>
          <button
            onClick={() => setShowNewPatientModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Patient
          </button>
        </div>

        {/* Offline/Mock Data Warning Banner */}
        {isUsingMockData && !isLoading && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Viewing demo data
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Could not connect to server. Displaying sample data.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <label htmlFor="patient-search" className="sr-only">Search patients</label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <input
                id="patient-search"
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="status-filter" className="sr-only">Filter by status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="discharged">Discharged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Days Sober
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Streak
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Counselor
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Admitted
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <LoadingWrapper
              isLoading={isLoading}
              skeleton={<PatientTableSkeleton rows={5} />}
              error={error}
              onRetry={handleRetry}
            >
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No patients found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/patients/${patient.id}`)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${patient.first_name} ${patient.last_name}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-400"
                            aria-hidden="true"
                          >
                            {patient.first_name[0]}{patient.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {patient.first_name} {patient.last_name}
                            </p>
                            {patient.registration_key && (
                              <p className="text-xs text-gray-400 font-mono">
                                Key: {patient.registration_key}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          role="status"
                          className={`badge ${
                            patient.status === 'active' ? 'badge-success' :
                            patient.status === 'pending' ? 'badge-warning' :
                            'badge-danger'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">{patient.days_sober}</span>
                        <span className="text-gray-400 text-sm"> days</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">{patient.check_in_streak}</span>
                        <span className="text-gray-400 text-sm"> days</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{patient.counselor_name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{patient.admission_date}</td>
                      <td className="px-6 py-4">
                        <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </LoadingWrapper>
          </table>
        </div>

        {/* New Patient Modal */}
        {showNewPatientModal && (
          <NewPatientModal
            isOpen={showNewPatientModal}
            onClose={() => {
              setShowNewPatientModal(false)
              setNewPatientKey(null)
              setSearchParams({})
            }}
            onSubmit={handleCreatePatient}
            newPatientKey={newPatientKey}
            onCopyKey={copyKey}
            copiedKey={copiedKey}
          />
        )}
      </div>
    </SectionErrorBoundary>
  )
}
