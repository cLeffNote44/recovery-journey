import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Users,
  Shield,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText,
  UserPlus,
  Edit,
} from 'lucide-react'
import { SectionErrorBoundary } from '../components/ErrorBoundary'

// Mock admin data
const mockAdmins: Record<string, {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  facility_id: string
  facility_name: string
  status: string
  hire_date: string
  last_login: string
  address: string
  emergency_contact: string
  emergency_phone: string
  bio: string
  permissions: string[]
}> = {
  '1': {
    id: '1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@hoperecovery.com',
    phone: '(555) 234-5678',
    facility_id: '1',
    facility_name: 'Hope Recovery Center',
    status: 'active',
    hire_date: '2021-06-15',
    last_login: '2025-11-21T08:00:00Z',
    address: '456 Oak Ave, Austin, TX 78702',
    emergency_contact: 'Michael Johnson',
    emergency_phone: '(555) 345-6789',
    bio: 'Experienced healthcare administrator with 10+ years in addiction treatment facility management.',
    permissions: ['manage_staff', 'manage_patients', 'view_reports', 'manage_billing', 'system_settings'],
  },
  '2': {
    id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael@newbeginnings.com',
    phone: '(555) 345-6789',
    facility_id: '2',
    facility_name: 'New Beginnings Treatment',
    status: 'active',
    hire_date: '2020-03-01',
    last_login: '2025-11-21T07:30:00Z',
    address: '789 Pine St, Houston, TX 77001',
    emergency_contact: 'Linda Chen',
    emergency_phone: '(555) 456-7890',
    bio: 'Dedicated administrator focused on operational excellence and patient care quality.',
    permissions: ['manage_staff', 'manage_patients', 'view_reports', 'manage_billing', 'system_settings'],
  },
  '3': {
    id: '3',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily@serenitysprings.com',
    phone: '(555) 456-7890',
    facility_id: '3',
    facility_name: 'Serenity Springs',
    status: 'active',
    hire_date: '2022-01-10',
    last_login: '2025-11-20T18:00:00Z',
    address: '321 Elm Blvd, Dallas, TX 75201',
    emergency_contact: 'Carlos Rodriguez',
    emergency_phone: '(555) 567-8901',
    bio: 'Healthcare management professional specializing in behavioral health services.',
    permissions: ['manage_staff', 'manage_patients', 'view_reports', 'manage_billing'],
  },
  '4': {
    id: '4',
    first_name: 'James',
    last_name: 'Wilson',
    email: 'james@pathway.com',
    phone: '(555) 567-8901',
    facility_id: '4',
    facility_name: 'Pathway to Wellness',
    status: 'pending',
    hire_date: '2025-11-01',
    last_login: '',
    address: '654 Maple Dr, San Antonio, TX 78201',
    emergency_contact: 'Susan Wilson',
    emergency_phone: '(555) 678-9012',
    bio: 'New administrator bringing fresh perspectives to recovery facility management.',
    permissions: ['manage_staff', 'manage_patients', 'view_reports'],
  },
}

const mockActivity = [
  { id: '1', type: 'staff_added', message: 'Added new clinician Dr. Martinez', time: '2 hours ago' },
  { id: '2', type: 'settings', message: 'Updated facility operating hours', time: '5 hours ago' },
  { id: '3', type: 'report', message: 'Generated monthly compliance report', time: '1 day ago' },
  { id: '4', type: 'patient', message: 'Approved patient transfer request', time: '2 days ago' },
  { id: '5', type: 'staff', message: 'Updated staff schedule for next week', time: '3 days ago' },
]

const mockFacilityStats = {
  total_patients: 85,
  total_staff: 18,
  occupancy_rate: 78,
  pending_tasks: 5,
}

export default function AdminDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const admin = mockAdmins[id || '1']

  if (!admin) {
    return (
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400">Administrator not found</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const permissionLabels: Record<string, string> = {
    manage_staff: 'Manage Staff',
    manage_patients: 'Manage Patients',
    view_reports: 'View Reports',
    manage_billing: 'Manage Billing',
    system_settings: 'System Settings',
  }

  return (
    <SectionErrorBoundary>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/administrators')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Back to administrators"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {admin.first_name} {admin.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Administrator - {admin.facility_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(admin.status)}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockFacilityStats.total_patients}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Facility Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockFacilityStats.total_staff}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Staff Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockFacilityStats.occupancy_rate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockFacilityStats.pending_tasks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">{admin.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-gray-900 dark:text-white">{admin.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Facility</p>
                  <p className="text-gray-900 dark:text-white">{admin.facility_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hire Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(admin.hire_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-gray-900 dark:text-white">{formatDateTime(admin.last_login)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                  <p className="text-gray-900 dark:text-white">Facility Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-400">{admin.bio}</p>
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Permissions</h2>
            <div className="flex flex-wrap gap-2">
              {admin.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                >
                  {permissionLabels[perm] || perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-gray-900 dark:text-white">{admin.emergency_contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-900 dark:text-white">{admin.emergency_phone}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'staff_added' ? 'bg-purple-100' :
                    activity.type === 'settings' ? 'bg-blue-100' :
                    activity.type === 'report' ? 'bg-green-100' :
                    activity.type === 'patient' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'staff_added' && <UserPlus className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'settings' && <Settings className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'report' && <FileText className="w-4 h-4 text-green-600" />}
                    {activity.type === 'patient' && <CheckCircle className="w-4 h-4 text-orange-600" />}
                    {activity.type === 'staff' && <Calendar className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </SectionErrorBoundary>
  )
}
