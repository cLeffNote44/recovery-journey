import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Shield,
  Edit,
} from 'lucide-react'
import { SectionErrorBoundary } from '../components/ErrorBoundary'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  department: string
  facility_name: string
  employee_id: string
  hire_date: string
  status: string
  patients_assigned: number
  caseload_capacity: number
  last_active: string
  address: string
  emergency_contact: string
  emergency_phone: string
  bio: string
  specializations: string[]
  certifications: { name: string; expiry: string }[]
  education: string
  supervisor: string
  schedule: { day: string; hours: string }[]
}

interface ActivityItem {
  id: string
  type: 'patient' | 'message' | 'note' | 'session' | 'alert'
  description: string
  time: string
  patient?: string
}

interface Task {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'overdue'
  patient?: string
}

const mockStaffData: Record<string, StaffMember> = {
  '1': {
    id: '1',
    first_name: 'Maria',
    last_name: 'Martinez',
    email: 'maria.martinez@hoperecovery.com',
    phone: '(512) 555-0101',
    role: 'counselor',
    department: 'Clinical Services',
    facility_name: 'Hope Recovery Center',
    employee_id: 'EMP-001',
    hire_date: '2021-03-15',
    status: 'active',
    patients_assigned: 12,
    caseload_capacity: 15,
    last_active: '2025-11-21T10:00:00Z',
    address: '123 Oak Street, Austin, TX 78701',
    emergency_contact: 'Carlos Martinez (Spouse)',
    emergency_phone: '(512) 555-0102',
    bio: 'Dr. Martinez is a licensed clinical psychologist with over 10 years of experience in addiction recovery. She specializes in cognitive behavioral therapy and trauma-informed care.',
    specializations: ['Alcohol Addiction', 'Trauma Recovery', 'CBT', 'Family Therapy'],
    certifications: [
      { name: 'Licensed Clinical Psychologist (LCP)', expiry: '2025-06-30' },
      { name: 'Certified Addiction Counselor (CAC)', expiry: '2025-12-31' },
      { name: 'EMDR Certified', expiry: '2026-03-15' },
    ],
    education: 'Ph.D. Clinical Psychology, University of Texas at Austin',
    supervisor: 'Dr. Robert Thompson',
    schedule: [
      { day: 'Monday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Tuesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Wednesday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Thursday', hours: '8:00 AM - 5:00 PM' },
      { day: 'Friday', hours: '8:00 AM - 12:00 PM' },
    ],
  },
  '2': {
    id: '2',
    first_name: 'Robert',
    last_name: 'Thompson',
    email: 'robert.thompson@hoperecovery.com',
    phone: '(512) 555-0103',
    role: 'therapist',
    department: 'Clinical Services',
    facility_name: 'Hope Recovery Center',
    employee_id: 'EMP-002',
    hire_date: '2019-08-01',
    status: 'active',
    patients_assigned: 15,
    caseload_capacity: 18,
    last_active: '2025-11-21T09:45:00Z',
    address: '456 Elm Avenue, Austin, TX 78702',
    emergency_contact: 'Susan Thompson (Spouse)',
    emergency_phone: '(512) 555-0104',
    bio: 'Dr. Thompson is the lead therapist with expertise in group therapy and substance abuse treatment. He oversees the clinical team and develops treatment protocols.',
    specializations: ['Group Therapy', 'Substance Abuse', 'Motivational Interviewing', 'Dual Diagnosis'],
    certifications: [
      { name: 'Licensed Professional Counselor (LPC)', expiry: '2025-09-30' },
      { name: 'Master Addiction Counselor (MAC)', expiry: '2026-01-15' },
    ],
    education: 'Psy.D. Counseling Psychology, Baylor University',
    supervisor: 'Dr. James Wilson (Medical Director)',
    schedule: [
      { day: 'Monday', hours: '7:00 AM - 4:00 PM' },
      { day: 'Tuesday', hours: '7:00 AM - 4:00 PM' },
      { day: 'Wednesday', hours: '7:00 AM - 4:00 PM' },
      { day: 'Thursday', hours: '7:00 AM - 4:00 PM' },
      { day: 'Friday', hours: '7:00 AM - 4:00 PM' },
    ],
  },
  '3': {
    id: '3',
    first_name: 'Lisa',
    last_name: 'Anderson',
    email: 'lisa.anderson@newbeginnings.com',
    phone: '(713) 555-0201',
    role: 'case_manager',
    department: 'Patient Services',
    facility_name: 'New Beginnings Treatment',
    employee_id: 'EMP-003',
    hire_date: '2022-01-10',
    status: 'active',
    patients_assigned: 20,
    caseload_capacity: 25,
    last_active: '2025-11-21T09:30:00Z',
    address: '789 Pine Road, Houston, TX 77001',
    emergency_contact: 'Mark Anderson (Brother)',
    emergency_phone: '(713) 555-0202',
    bio: 'Lisa coordinates patient care and ensures smooth transitions through treatment phases. She has a background in social work and specializes in discharge planning.',
    specializations: ['Discharge Planning', 'Resource Coordination', 'Insurance Navigation', 'Family Support'],
    certifications: [
      { name: 'Licensed Social Worker (LSW)', expiry: '2025-04-30' },
      { name: 'Case Management Certification (CCM)', expiry: '2025-08-15' },
    ],
    education: 'M.S.W. Social Work, University of Houston',
    supervisor: 'Sarah Johnson (Administrator)',
    schedule: [
      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
      { day: 'Friday', hours: '9:00 AM - 3:00 PM' },
    ],
  },
}

const mockActivity: ActivityItem[] = [
  { id: '1', type: 'session', description: 'Completed individual therapy session', time: '30 minutes ago', patient: 'John Doe' },
  { id: '2', type: 'note', description: 'Added progress notes', time: '1 hour ago', patient: 'Jane Smith' },
  { id: '3', type: 'message', description: 'Sent check-in message', time: '2 hours ago', patient: 'Michael Brown' },
  { id: '4', type: 'patient', description: 'New patient assigned', time: '3 hours ago', patient: 'Sarah Davis' },
  { id: '5', type: 'session', description: 'Led group therapy session', time: 'Yesterday', patient: '8 participants' },
  { id: '6', type: 'alert', description: 'Responded to craving alert', time: 'Yesterday', patient: 'John Doe' },
]

const mockTasks: Task[] = [
  { id: '1', title: 'Complete intake assessment', dueDate: '2025-11-22', priority: 'high', status: 'pending', patient: 'Sarah Davis' },
  { id: '2', title: 'Review treatment plan', dueDate: '2025-11-23', priority: 'medium', status: 'pending', patient: 'John Doe' },
  { id: '3', title: 'Schedule family session', dueDate: '2025-11-24', priority: 'low', status: 'pending', patient: 'Jane Smith' },
  { id: '4', title: 'Submit weekly report', dueDate: '2025-11-21', priority: 'high', status: 'overdue' },
  { id: '5', title: 'Update discharge plan', dueDate: '2025-11-20', priority: 'medium', status: 'completed', patient: 'Michael Brown' },
]

const mockAssignedPatients = [
  { id: '1', name: 'John Doe', status: 'active', daysInProgram: 45, lastCheckIn: '2025-11-21' },
  { id: '2', name: 'Jane Smith', status: 'active', daysInProgram: 30, lastCheckIn: '2025-11-20' },
  { id: '3', name: 'Michael Brown', status: 'active', daysInProgram: 60, lastCheckIn: '2025-11-21' },
  { id: '4', name: 'Sarah Davis', status: 'pending', daysInProgram: 0, lastCheckIn: null },
]

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'tasks' | 'activity'>('overview')

  useEffect(() => {
    setTimeout(() => {
      if (id && mockStaffData[id]) {
        setStaff(mockStaffData[id])
      }
      setIsLoading(false)
    }, 300)
  }, [id])

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      counselor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      therapist: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      case_manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      nurse: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      facility_admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    const labels: Record<string, string> = {
      counselor: 'Counselor',
      therapist: 'Therapist',
      case_manager: 'Case Manager',
      nurse: 'Nurse',
      facility_admin: 'Administrator',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session': return <Calendar className="w-4 h-4 text-purple-500" />
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'note': return <FileText className="w-4 h-4 text-green-500" />
      case 'patient': return <Users className="w-4 h-4 text-indigo-500" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>{priority}</span>
  }

  const getTaskStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{status}</span>
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="p-6 text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Staff member not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:text-blue-700">Go back</button>
      </div>
    )
  }

  const caseloadPercentage = Math.round((staff.patients_assigned / staff.caseload_capacity) * 100)

  return (
    <SectionErrorBoundary>
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {staff.first_name[0]}{staff.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staff.first_name} {staff.last_name}
                </h1>
                {getRoleBadge(staff.role)}
              </div>
              <p className="text-gray-500 dark:text-gray-400">{staff.department} • {staff.facility_name}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/staff/${staff.id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staff.patients_assigned}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patients Assigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockTasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sessions This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              caseloadPercentage >= 90 ? 'bg-red-100 dark:bg-red-900' : caseloadPercentage >= 70 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'
            }`}>
              <Briefcase className={`w-5 h-5 ${
                caseloadPercentage >= 90 ? 'text-red-600 dark:text-red-400' : caseloadPercentage >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseloadPercentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Caseload Capacity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['overview', 'patients', 'tasks', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{staff.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{staff.address}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emergency Contact</p>
                <p className="text-sm text-gray-900 dark:text-white">{staff.emergency_contact}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{staff.emergency_phone}</p>
              </div>
            </div>

            {/* Employment Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Employee ID</span>
                  <span className="text-gray-900 dark:text-white font-medium">{staff.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Hire Date</span>
                  <span className="text-gray-900 dark:text-white">{staff.hire_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Department</span>
                  <span className="text-gray-900 dark:text-white">{staff.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Supervisor</span>
                  <span className="text-gray-900 dark:text-white">{staff.supervisor}</span>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule
              </h3>
              <div className="space-y-2">
                {staff.schedule.map((s) => (
                  <div key={s.day} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{s.day}</span>
                    <span className="text-gray-900 dark:text-white">{s.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right Columns */}
          <div className="col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                About
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{staff.bio}</p>
            </div>

            {/* Specializations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.specializations.map((spec) => (
                  <span key={spec} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{staff.education}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Certifications
                </h3>
                <div className="space-y-2">
                  {staff.certifications.map((cert) => (
                    <div key={cert.name} className="text-sm">
                      <p className="text-gray-900 dark:text-white">{cert.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {cert.expiry}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Days in Program</th>
                <th className="px-5 py-3 font-medium">Last Check-in</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockAssignedPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{patient.name}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>{patient.status}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{patient.daysInProgram}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{patient.lastCheckIn || 'N/A'}</td>
                  <td className="px-5 py-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                <th className="px-5 py-3 font-medium">Task</th>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Due Date</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{task.title}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{task.patient || '-'}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{task.dueDate}</td>
                  <td className="px-5 py-4">{getPriorityBadge(task.priority)}</td>
                  <td className="px-5 py-4">{getTaskStatusBadge(task.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                  {activity.patient && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Patient: {activity.patient}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </SectionErrorBoundary>
  )
}
