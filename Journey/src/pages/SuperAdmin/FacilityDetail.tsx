import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

// Mock facility data
const mockFacilityData: Record<string, {
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
  last_active: string
  stats: {
    active_patients: number
    check_ins_today: number
    alerts: number
    avg_days_sober: number
    patients_change: number
    check_ins_change: number
    alerts_change: number
    sober_change: number
  }
  recent_activity: Array<{ id: string; type: string; message: string; time: string }>
  staff: Array<{ id: string; name: string; role: string; patients_assigned: number; last_active: string }>
  patients: Array<{ id: string; name: string; status: string; days_in_program: number; counselor: string }>
}> = {
  '1': {
    id: '1',
    name: 'Hope Recovery Center',
    city: 'Austin',
    state: 'TX',
    address: '123 Recovery Lane',
    phone: '(512) 555-0100',
    email: 'contact@hoperecovery.com',
    status: 'active',
    patient_count: 85,
    staff_count: 18,
    last_active: '2025-11-21T10:30:00Z',
    stats: {
      active_patients: 85,
      check_ins_today: 72,
      alerts: 3,
      avg_days_sober: 45,
      patients_change: 5,
      check_ins_change: 8,
      alerts_change: -2,
      sober_change: 3,
    },
    recent_activity: [
      { id: '1', type: 'check_in', message: 'John D. completed morning check-in', time: '10 minutes ago' },
      { id: '2', type: 'alert', message: 'Missed check-in alert for Sarah M.', time: '1 hour ago' },
      { id: '3', type: 'milestone', message: 'Mike T. reached 30 days sober', time: '2 hours ago' },
    ],
    staff: [
      { id: '1', name: 'Dr. Maria Martinez', role: 'counselor', patients_assigned: 12, last_active: '2025-11-21T10:00:00Z' },
      { id: '2', name: 'Dr. Robert Thompson', role: 'therapist', patients_assigned: 15, last_active: '2025-11-21T09:45:00Z' },
      { id: '3', name: 'Lisa Anderson', role: 'case_manager', patients_assigned: 18, last_active: '2025-11-21T09:30:00Z' },
    ],
    patients: [
      { id: '1', name: 'John Doe', status: 'active', days_in_program: 45, counselor: 'Dr. Martinez' },
      { id: '2', name: 'Jane Smith', status: 'active', days_in_program: 30, counselor: 'Dr. Thompson' },
      { id: '3', name: 'Michael Brown', status: 'active', days_in_program: 60, counselor: 'Lisa Anderson' },
    ],
  },
  '2': {
    id: '2',
    name: 'New Beginnings Treatment',
    city: 'Houston',
    state: 'TX',
    address: '456 Wellness Blvd',
    phone: '(713) 555-0200',
    email: 'info@newbeginnings.com',
    status: 'active',
    patient_count: 120,
    staff_count: 25,
    last_active: '2025-11-21T09:15:00Z',
    stats: {
      active_patients: 120,
      check_ins_today: 98,
      alerts: 5,
      avg_days_sober: 38,
      patients_change: 12,
      check_ins_change: 15,
      alerts_change: 1,
      sober_change: 2,
    },
    recent_activity: [
      { id: '1', type: 'patient_added', message: 'New patient enrolled', time: '30 minutes ago' },
      { id: '2', type: 'check_in', message: 'Group therapy session completed', time: '2 hours ago' },
    ],
    staff: [
      { id: '1', name: 'Amanda White', role: 'nurse', patients_assigned: 30, last_active: '2025-11-21T10:15:00Z' },
      { id: '2', name: 'Dr. Kevin Park', role: 'counselor', patients_assigned: 20, last_active: '2025-11-21T08:15:00Z' },
    ],
    patients: [
      { id: '1', name: 'Sarah Davis', status: 'active', days_in_program: 15, counselor: 'Amanda White' },
      { id: '2', name: 'David Wilson', status: 'discharged', days_in_program: 90, counselor: 'Dr. Park' },
    ],
  },
  '3': {
    id: '3',
    name: 'Serenity Springs',
    city: 'Dallas',
    state: 'TX',
    address: '789 Healing Way',
    phone: '(214) 555-0300',
    email: 'hello@serenitysprings.com',
    status: 'active',
    patient_count: 65,
    staff_count: 12,
    last_active: '2025-11-21T08:45:00Z',
    stats: {
      active_patients: 65,
      check_ins_today: 58,
      alerts: 1,
      avg_days_sober: 52,
      patients_change: 3,
      check_ins_change: 5,
      alerts_change: -1,
      sober_change: 5,
    },
    recent_activity: [
      { id: '1', type: 'milestone', message: 'Facility reached 90% check-in compliance', time: '1 hour ago' },
    ],
    staff: [
      { id: '1', name: 'Dr. Emily Chen', role: 'therapist', patients_assigned: 22, last_active: '2025-11-21T08:30:00Z' },
    ],
    patients: [
      { id: '1', name: 'Chris Johnson', status: 'active', days_in_program: 75, counselor: 'Dr. Chen' },
    ],
  },
  '4': {
    id: '4',
    name: 'Pathway to Wellness',
    city: 'San Antonio',
    state: 'TX',
    address: '321 Hope Street',
    phone: '(210) 555-0400',
    email: 'contact@pathway.com',
    status: 'pending',
    patient_count: 0,
    staff_count: 3,
    last_active: '2025-11-20T14:00:00Z',
    stats: {
      active_patients: 0,
      check_ins_today: 0,
      alerts: 0,
      avg_days_sober: 0,
      patients_change: 0,
      check_ins_change: 0,
      alerts_change: 0,
      sober_change: 0,
    },
    recent_activity: [],
    staff: [],
    patients: [],
  },
  '5': {
    id: '5',
    name: 'Horizon Health',
    city: 'Denver',
    state: 'CO',
    address: '555 Mountain View',
    phone: '(303) 555-0500',
    email: 'info@horizonhealth.com',
    status: 'suspended',
    patient_count: 45,
    staff_count: 8,
    last_active: '2025-11-15T16:30:00Z',
    stats: {
      active_patients: 45,
      check_ins_today: 0,
      alerts: 12,
      avg_days_sober: 28,
      patients_change: -5,
      check_ins_change: -40,
      alerts_change: 8,
      sober_change: -3,
    },
    recent_activity: [
      { id: '1', type: 'alert', message: 'Facility suspended due to compliance issues', time: '6 days ago' },
    ],
    staff: [],
    patients: [],
  },
}

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [facility, setFacility] = useState<typeof mockFacilityData['1'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (id && mockFacilityData[id]) {
        setFacility(mockFacilityData[id])
      }
      setIsLoading(false)
    }, 300)
  }, [id])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      counselor: 'bg-blue-100 text-blue-800',
      therapist: 'bg-purple-100 text-purple-800',
      case_manager: 'bg-indigo-100 text-indigo-800',
      nurse: 'bg-pink-100 text-pink-800',
    }
    const labels: Record<string, string> = {
      counselor: 'Counselor',
      therapist: 'Therapist',
      case_manager: 'Case Manager',
      nurse: 'Nurse',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
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

  const stats = facility.stats

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/facilities')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{facility.name}</h1>
            {getStatusBadge(facility.status)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {facility.address}, {facility.city}, {facility.state}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {facility.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {facility.email}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.patients_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.patients_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(stats.patients_change)}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_patients}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Patients</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.check_ins_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.check_ins_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(stats.check_ins_change)}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.check_ins_today}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check-ins Today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.alerts_change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.alerts_change <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {Math.abs(stats.alerts_change)}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.alerts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.sober_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.sober_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(stats.sober_change)}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_days_sober}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Days Sober</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {facility.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {facility.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'alert' ? 'bg-red-100' :
                    activity.type === 'milestone' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'alert' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : activity.type === 'milestone' ? (
                      <Activity className="w-4 h-4 text-purple-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>

        {/* Facility Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Facility Info</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Staff</p>
                <p className="font-semibold text-gray-900 dark:text-white">{facility.staff_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
                <p className="font-semibold text-gray-900 dark:text-white">{facility.patient_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(facility.last_active)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
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
                <th className="pb-3 font-medium">Patients Assigned</th>
                <th className="pb-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {facility.staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{member.name}</td>
                  <td className="py-3">{getRoleBadge(member.role)}</td>
                  <td className="py-3 text-gray-900 dark:text-white">{member.patients_assigned}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{formatDate(member.last_active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No staff members</p>
        )}
      </div>

      {/* Patients Table */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Patients</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{facility.patients.length} patients shown</span>
        </div>
        {facility.patients.length > 0 ? (
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
              {facility.patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{patient.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' :
                      patient.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </td>
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
