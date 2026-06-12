import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  FileText,
  Activity,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { useAdminFacility, useAdminPatients } from '../../hooks'
import { getStatusBadge, getRoleBadge, formatDate, mapAdminPatient } from '../../components/SuperAdmin'

// ── View models ────────────────────────────────────────────────────────────

interface VMStaff {
  id: string
  name: string
  role: string
  email?: string
  status?: string
}

interface VMPatient {
  id: string
  name: string
  status: string
  days_in_program: number
  counselor: string
}

interface FacilityVM {
  id: string
  name: string
  city: string
  state: string
  address: string
  phone: string
  email: string
  status: string
  patient_count: number
  staff_count: number
  treatment_plan_count: number
  last_active: string
  staff: VMStaff[]
}

interface RealStaff {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  status?: string
}

interface RealFacility {
  id: string
  name: string
  city?: string
  state?: string
  address?: string
  phone?: string
  email?: string
  status?: string
  updatedAt?: string
  createdAt?: string
  staff?: RealStaff[]
  _count?: { patients?: number; treatmentPlans?: number }
}

function realToVM(f: RealFacility): FacilityVM {
  return {
    id: f.id,
    name: f.name,
    city: f.city ?? '',
    state: f.state ?? '',
    address: f.address ?? '',
    phone: f.phone ?? '',
    email: f.email ?? '',
    status: String(f.status ?? 'active').toLowerCase(),
    patient_count: f._count?.patients ?? 0,
    staff_count: Array.isArray(f.staff) ? f.staff.length : 0,
    treatment_plan_count: f._count?.treatmentPlans ?? 0,
    last_active: f.updatedAt ?? f.createdAt ?? '',
    staff: (f.staff ?? []).map((s) => ({
      id: s.id,
      name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email || 'Staff',
      role: String(s.role ?? '').toLowerCase(),
      email: s.email,
      status: String(s.status ?? '').toLowerCase(),
    })),
  }
}

// Minimal demo fallback so the mock dashboard's facilities still drill down
// when the API is unavailable. Real facilities use real cuid ids.
const mockFacilities: Record<string, FacilityVM & { patients: VMPatient[] }> = {
  '1': {
    id: '1', name: 'Hope Recovery Center', city: 'Austin', state: 'TX', address: '123 Recovery Lane',
    phone: '(512) 555-0100', email: 'contact@hoperecovery.com', status: 'active',
    patient_count: 85, staff_count: 3, treatment_plan_count: 6, last_active: '2025-11-21T10:30:00Z',
    staff: [
      { id: '1', name: 'Dr. Maria Martinez', role: 'counselor', email: 'maria@hoperecovery.com', status: 'active' },
      { id: '2', name: 'Dr. Robert Thompson', role: 'counselor', email: 'robert@hoperecovery.com', status: 'active' },
      { id: '3', name: 'Lisa Anderson', role: 'facility_admin', email: 'lisa@hoperecovery.com', status: 'active' },
    ],
    patients: [
      { id: '1', name: 'John Doe', status: 'active', days_in_program: 45, counselor: 'Dr. Martinez' },
      { id: '2', name: 'Jane Smith', status: 'active', days_in_program: 30, counselor: 'Dr. Thompson' },
    ],
  },
  '2': {
    id: '2', name: 'New Beginnings Treatment', city: 'Houston', state: 'TX', address: '456 Wellness Blvd',
    phone: '(713) 555-0200', email: 'info@newbeginnings.com', status: 'active',
    patient_count: 120, staff_count: 2, treatment_plan_count: 4, last_active: '2025-11-21T09:15:00Z',
    staff: [
      { id: '1', name: 'Amanda White', role: 'counselor', email: 'amanda@newbeginnings.com', status: 'active' },
      { id: '2', name: 'Dr. Kevin Park', role: 'facility_admin', email: 'kevin@newbeginnings.com', status: 'active' },
    ],
    patients: [
      { id: '1', name: 'Sarah Davis', status: 'pending', days_in_program: 0, counselor: 'Amanda White' },
    ],
  },
}

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const facilityQuery = useAdminFacility(id)
  const patientsQuery = useAdminPatients(id ? { facility_id: id } : {})

  const realFacility = facilityQuery.data?.facility
  const usingMock = !facilityQuery.isLoading && !realFacility
  const mock = id ? mockFacilities[id] : undefined

  const facility: FacilityVM | null = realFacility
    ? realToVM(realFacility)
    : usingMock && mock
      ? mock
      : null

  const patients: VMPatient[] = realFacility
    ? (patientsQuery.data?.patients ?? []).map((p: Parameters<typeof mapAdminPatient>[0]) => {
        const m = mapAdminPatient(p)
        return {
          id: m.id,
          name: `${m.first_name} ${m.last_name}`.trim(),
          status: m.status,
          days_in_program: m.days_in_program,
          counselor: m.counselor_name,
        }
      })
    : (mock?.patients ?? [])

  if (facilityQuery.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Facility not found</h2>
          <button onClick={() => navigate('/facilities')} className="mt-4 text-blue-600 hover:text-blue-700">
            Back to Facilities
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: <Users className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100', value: facility.patient_count, label: 'Total Patients' },
    { icon: <Building2 className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', value: facility.staff_count, label: 'Staff Members' },
    { icon: <FileText className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', value: facility.treatment_plan_count, label: 'Treatment Plans' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/facilities')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Back to facilities"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{facility.name}</h1>
            {getStatusBadge(facility.status)}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
            {(facility.address || facility.city) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                {[facility.address, facility.city, facility.state].filter(Boolean).join(', ')}
              </span>
            )}
            {facility.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" aria-hidden="true" />
                {facility.phone}
              </span>
            )}
            {facility.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" aria-hidden="true" />
                {facility.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {usingMock && (
        <div
          className="mb-6 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2"
          role="status"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Showing demo data — the server is unavailable.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${c.bg} dark:bg-opacity-20 rounded-lg flex items-center justify-center`}>
                {c.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Info */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Facility Info</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="font-semibold text-gray-900 dark:text-white">{formatDate(facility.last_active)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Staff Members</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{facility.staff.length} members</span>
        </div>
        {facility.staff.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {facility.staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{member.name}</td>
                  <td className="py-3">{getRoleBadge(member.role)}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{member.email ?? '—'}</td>
                  <td className="py-3">{member.status ? getStatusBadge(member.status) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No staff members</p>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Patients</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{patients.length} patients</span>
        </div>
        {patients.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Days in Program</th>
                <th className="pb-3 font-medium">Assigned Counselor</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{patient.name}</td>
                  <td className="py-3">{getStatusBadge(patient.status)}</td>
                  <td className="py-3 text-gray-900 dark:text-white">{patient.days_in_program}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{patient.counselor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No patients</p>
        )}
      </div>
    </div>
  )
}
