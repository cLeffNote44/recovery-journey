import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Settings, X, AlertTriangle } from 'lucide-react'
import { showToast } from '../../components/Toast'
import {
  useAdminStats,
  useAdminFacilities,
  useAdminAdministrators,
  useAdminClinicians,
  useAdminPatients,
  useAdminActivity,
} from '../../hooks'

// Import components
import {
  StatsCards,
  RecentActivity,
  QuickActions,
  FacilitiesTable,
  AnalyticsSection,
  DataTable,
  DashboardWidget,
  WIDGET_LABELS,
  Facility,
  Administrator,
  Clinician,
  Patient,
  DashboardStats,
  ActivityItem,
  getStatusBadge,
  getRoleBadge,
  formatDate,
  mapStats,
  mapFacility,
  mapAdministrator,
  mapClinician,
  mapAdminPatient,
  mapActivity,
  AddAdministratorModal,
  AddClinicianModal,
  AddPatientModal,
} from '../../components/SuperAdmin'

// Mock data for offline mode
import {
  mockStats,
  mockFacilities,
  mockAdministrators,
  mockClinicians,
  mockPatients,
  mockRecentActivity,
} from '../../components/SuperAdmin/mockData'

import WelcomeWizard from './WelcomeWizard'

type TabType = 'overview' | 'facilities' | 'administrators' | 'clinicians' | 'patients'

interface Props {
  initialTab?: TabType
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  'facilities',
  'staff',
  'patients',
  'active',
  'recentActivity',
  'quickActions',
  'facilitiesTable',
  'analytics',
  'charts',
]

export default function SuperAdminDashboard({ initialTab = 'overview' }: Props) {
  const activeTab = initialTab
  const navigate = useNavigate()

  // Modal states
  const [showWizard, setShowWizard] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showClinicianModal, setShowClinicianModal] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)

  // Dashboard customization
  const [visibleWidgets, setVisibleWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets')
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Live data (React Query). Each hook falls back to mock data on the page
  // when the API is unavailable, so the dashboard always renders something.
  const statsQuery = useAdminStats()
  const facilitiesQuery = useAdminFacilities()
  const administratorsQuery = useAdminAdministrators()
  const cliniciansQuery = useAdminClinicians()
  const patientsQuery = useAdminPatients()
  const activityQuery = useAdminActivity()

  const fromApi = (q: { data?: { isFromApi?: boolean } }) => q.data?.isFromApi === true

  const stats: DashboardStats = fromApi(statsQuery)
    ? mapStats(statsQuery.data!.stats)
    : mockStats
  const facilities: Facility[] = fromApi(facilitiesQuery)
    ? facilitiesQuery.data!.facilities.map(mapFacility)
    : mockFacilities
  const administrators: Administrator[] = fromApi(administratorsQuery)
    ? administratorsQuery.data!.administrators.map(mapAdministrator)
    : mockAdministrators
  const clinicians: Clinician[] = fromApi(cliniciansQuery)
    ? cliniciansQuery.data!.clinicians.map(mapClinician)
    : mockClinicians
  const patients: Patient[] = fromApi(patientsQuery)
    ? patientsQuery.data!.patients.map(mapAdminPatient)
    : mockPatients
  const activities: ActivityItem[] = fromApi(activityQuery)
    ? activityQuery.data!.activity.map(mapActivity)
    : mockRecentActivity

  // Show the demo-data banner once the primary query has settled off the API.
  const isUsingMockData = !statsQuery.isLoading && !fromApi(statsQuery)

  // When connected to a real but empty system, guide setup with the wizard.
  const facilitiesData = facilitiesQuery.data
  useEffect(() => {
    if (facilitiesData?.isFromApi && facilitiesData.facilities.length === 0) {
      setShowWizard(true)
    }
  }, [facilitiesData])

  // Widget customization
  const toggleWidget = (widget: DashboardWidget) => {
    const updated = visibleWidgets.includes(widget)
      ? visibleWidgets.filter((w) => w !== widget)
      : [...visibleWidgets, widget]
    setVisibleWidgets(updated)
    localStorage.setItem('dashboardWidgets', JSON.stringify(updated))
  }

  if (showWizard) {
    return <WelcomeWizard onComplete={() => setShowWizard(false)} />
  }

  // Filter helpers
  const filterBySearch = <T extends { first_name: string; last_name: string }>(
    items: T[]
  ) =>
    items.filter((item) =>
      `${item.first_name} ${item.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )

  const filterFacilities = () =>
    facilities
      .filter((f) => statusFilter === 'all' || f.status === statusFilter)
      .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filterClinicians = () =>
    clinicians
      .filter((c) => statusFilter === 'all' || c.role === statusFilter)
      .filter((c) =>
        `${c.first_name} ${c.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )

  const filterPatients = () =>
    patients
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .filter((p) =>
        `${p.first_name} ${p.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )

  const getTabTitle = () => {
    const titles: Record<TabType, string> = {
      overview: 'Dashboard',
      facilities: 'Facilities',
      administrators: 'Administrators',
      clinicians: 'Clinicians',
      patients: 'Patients',
    }
    return titles[activeTab]
  }

  const getTabDescription = () => {
    const descriptions: Record<TabType, string> = {
      overview: 'Overview and analytics',
      facilities: 'Manage all facilities',
      administrators: 'Manage facility administrators',
      clinicians: 'Manage clinicians across facilities',
      patients: 'View all patients',
    }
    return descriptions[activeTab]
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTabTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{getTabDescription()}</p>
        </div>

        {activeTab === 'overview' && (
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Customize Dashboard
          </button>
        )}

        {activeTab === 'facilities' && (
          <button
            onClick={() => setShowWizard(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Facility
          </button>
        )}

        {activeTab === 'administrators' && (
          <button
            onClick={() => setShowAdminModal(true)}
            disabled={isUsingMockData}
            title={isUsingMockData ? 'Unavailable while showing demo data' : undefined}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Administrator
          </button>
        )}

        {activeTab === 'clinicians' && (
          <button
            onClick={() => setShowClinicianModal(true)}
            disabled={isUsingMockData}
            title={isUsingMockData ? 'Unavailable while showing demo data' : undefined}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Clinician
          </button>
        )}

        {activeTab === 'patients' && (
          <button
            onClick={() => setShowPatientModal(true)}
            disabled={isUsingMockData}
            title={isUsingMockData ? 'Unavailable while showing demo data' : undefined}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        )}
      </div>

      {isUsingMockData && (
        <div
          className="mb-6 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2"
          role="status"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Showing demo data — the server is unavailable, so figures may not reflect live activity.
          </p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <StatsCards stats={stats} visibleWidgets={visibleWidgets} />

          <div className="grid grid-cols-3 gap-6">
            {visibleWidgets.includes('recentActivity') && (
              <RecentActivity activities={activities} />
            )}
            {visibleWidgets.includes('quickActions') && (
              <QuickActions
                onAddFacility={() => setShowWizard(true)}
                onAddAdmin={() => setShowAdminModal(true)}
                onExportReport={() => {
                  const date = new Date().toISOString().split('T')[0]
                  const csvRows = [
                    ['Recovery Journey System Report', date].join(','),
                    '',
                    ['Metric', 'Value'].join(','),
                    ['Total Facilities', stats.total_facilities].join(','),
                    ['Total Staff', stats.total_staff].join(','),
                    ['Total Patients', stats.total_patients].join(','),
                    ['Active Patients', stats.total_patients].join(','),
                    '',
                    ['Facility', 'City', 'State', 'Status', 'Patients', 'Staff'].join(','),
                    ...facilities.map((f) =>
                      [
                        `"${f.name}"`,
                        `"${f.city}"`,
                        `"${f.state}"`,
                        f.status,
                        f.patient_count,
                        f.staff_count,
                      ].join(',')
                    ),
                  ]
                  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `system-report-${date}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  showToast.success('Report exported!')
                }}
              />
            )}
          </div>

          {visibleWidgets.includes('facilitiesTable') && (
            <FacilitiesTable facilities={facilities} />
          )}

          <AnalyticsSection
            showAnalytics={visibleWidgets.includes('analytics')}
            showCharts={visibleWidgets.includes('charts')}
          />
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <DataTable
          data={filterFacilities()}
          columns={[
            {
              key: 'name',
              header: 'Facility',
              render: (f) => (
                <p className="font-medium text-gray-900 dark:text-white">{f.name}</p>
              ),
            },
            {
              key: 'location',
              header: 'Location',
              render: (f) => (
                <span className="text-gray-600 dark:text-gray-400">
                  {f.city}, {f.state}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (f) => getStatusBadge(f.status),
            },
            {
              key: 'patient_count',
              header: 'Patients',
              render: (f) => (
                <span className="text-gray-900 dark:text-white">{f.patient_count}</span>
              ),
            },
            {
              key: 'staff_count',
              header: 'Staff',
              render: (f) => (
                <span className="text-gray-900 dark:text-white">{f.staff_count}</span>
              ),
            },
            {
              key: 'last_active',
              header: 'Last Active',
              render: (f) => (
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(f.last_active)}
                </span>
              ),
            },
          ]}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search facilities..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          onView={(f) => navigate(`/facility/${f.id}`)}
          onEdit={() => {}}
        />
      )}

      {/* Administrators Tab */}
      {activeTab === 'administrators' && (
        <DataTable
          data={filterBySearch(administrators)}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (a) => (
                <p className="font-medium text-gray-900 dark:text-white">
                  {a.first_name} {a.last_name}
                </p>
              ),
            },
            {
              key: 'email',
              header: 'Email',
              render: (a) => (
                <span className="text-gray-600 dark:text-gray-400">{a.email}</span>
              ),
            },
            {
              key: 'facility_name',
              header: 'Facility',
              render: (a) => (
                <span className="text-gray-900 dark:text-white">{a.facility_name}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (a) => getStatusBadge(a.status),
            },
            {
              key: 'last_login',
              header: 'Last Login',
              render: (a) => (
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(a.last_login)}
                </span>
              ),
            },
          ]}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search administrators..."
          onView={(a) => navigate(`/admin/${a.id}`)}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}

      {/* Clinicians Tab */}
      {activeTab === 'clinicians' && (
        <DataTable
          data={filterClinicians()}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (c) => (
                <p className="font-medium text-gray-900 dark:text-white">
                  {c.first_name} {c.last_name}
                </p>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: (c) => getRoleBadge(c.role),
            },
            {
              key: 'facility_name',
              header: 'Facility',
              render: (c) => (
                <span className="text-gray-900 dark:text-white">{c.facility_name}</span>
              ),
            },
            {
              key: 'patients_assigned',
              header: 'Patients Assigned',
              render: (c) => (
                <span className="text-gray-900 dark:text-white">{c.patients_assigned}</span>
              ),
            },
            {
              key: 'last_active',
              header: 'Last Active',
              render: (c) => (
                <span className="text-gray-600 dark:text-gray-400">
                  {formatDate(c.last_active)}
                </span>
              ),
            },
          ]}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search clinicians..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={[
            { value: 'all', label: 'All Roles' },
            { value: 'counselor', label: 'Counselor' },
            { value: 'therapist', label: 'Therapist' },
            { value: 'case_manager', label: 'Case Manager' },
            { value: 'nurse', label: 'Nurse' },
          ]}
          onView={(c) => navigate(`/staff/${c.id}`)}
          onEdit={() => {}}
        />
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <DataTable
          data={filterPatients()}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (p) => (
                <p className="font-medium text-gray-900 dark:text-white">
                  {p.first_name} {p.last_name}
                </p>
              ),
            },
            {
              key: 'facility_name',
              header: 'Facility',
              render: (p) => (
                <span className="text-gray-900 dark:text-white">{p.facility_name}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (p) => getStatusBadge(p.status),
            },
            {
              key: 'days_in_program',
              header: 'Days in Program',
              render: (p) => (
                <span className="text-gray-900 dark:text-white">{p.days_in_program}</span>
              ),
            },
            {
              key: 'counselor_name',
              header: 'Assigned Counselor',
              render: (p) => (
                <span className="text-gray-600 dark:text-gray-400">{p.counselor_name}</span>
              ),
            },
          ]}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search patients..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'discharged', label: 'Discharged' },
          ]}
          onView={(p) => navigate(`/patient/${p.id}`)}
          onEdit={() => {}}
        />
      )}

      {/* Customize Dashboard Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Customize Dashboard
              </h2>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {(Object.keys(WIDGET_LABELS) as DashboardWidget[]).map((widget) => (
                <label
                  key={widget}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleWidgets.includes(widget)}
                    onChange={() => toggleWidget(widget)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">
                    {WIDGET_LABELS[widget]}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create entity modals (Administrator / Clinician / Patient) */}
      <AddAdministratorModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        facilities={facilities}
      />
      <AddClinicianModal
        isOpen={showClinicianModal}
        onClose={() => setShowClinicianModal(false)}
        facilities={facilities}
      />
      <AddPatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        facilities={facilities}
      />
    </div>
  )
}
