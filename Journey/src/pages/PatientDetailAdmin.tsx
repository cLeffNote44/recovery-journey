import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  User,
  Clock,
  Activity,
  CheckCircle,
  Heart,
  FileText,
  MessageSquare,
  TrendingUp,
  Edit,
  Shield,
} from 'lucide-react'

// Mock patient data
const mockPatients: Record<string, {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  facility_id: string
  facility_name: string
  status: string
  admission_date: string
  expected_discharge: string
  days_in_program: number
  counselor_name: string
  counselor_id: string
  address: string
  emergency_contact: string
  emergency_phone: string
  emergency_relation: string
  insurance_provider: string
  insurance_id: string
  primary_diagnosis: string
  secondary_diagnoses: string[]
  treatment_plan: string
  phase: string
  phase_progress: number
  risk_level: string
  notes: string
}> = {
  '1': {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 111-2222',
    date_of_birth: '1985-03-15',
    gender: 'Male',
    facility_id: '1',
    facility_name: 'Hope Recovery Center',
    status: 'active',
    admission_date: '2025-10-07',
    expected_discharge: '2025-12-07',
    days_in_program: 45,
    counselor_name: 'Dr. Maria Martinez',
    counselor_id: '1',
    address: '123 Recovery Lane, Austin, TX 78701',
    emergency_contact: 'Jane Doe',
    emergency_phone: '(555) 333-4444',
    emergency_relation: 'Spouse',
    insurance_provider: 'Blue Cross Blue Shield',
    insurance_id: 'BCBS-123456789',
    primary_diagnosis: 'Alcohol Use Disorder',
    secondary_diagnoses: ['Anxiety Disorder', 'Depression'],
    treatment_plan: 'Comprehensive Recovery Program',
    phase: 'Active Treatment',
    phase_progress: 65,
    risk_level: 'moderate',
    notes: 'Patient showing good progress. Engaged in group therapy sessions.',
  },
  '2': {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 222-3333',
    date_of_birth: '1990-07-22',
    gender: 'Female',
    facility_id: '1',
    facility_name: 'Hope Recovery Center',
    status: 'active',
    admission_date: '2025-10-22',
    expected_discharge: '2025-12-22',
    days_in_program: 30,
    counselor_name: 'Dr. Robert Thompson',
    counselor_id: '2',
    address: '456 Healing St, Austin, TX 78702',
    emergency_contact: 'Robert Smith',
    emergency_phone: '(555) 444-5555',
    emergency_relation: 'Brother',
    insurance_provider: 'Aetna',
    insurance_id: 'AET-987654321',
    primary_diagnosis: 'Opioid Use Disorder',
    secondary_diagnoses: ['PTSD'],
    treatment_plan: 'MAT + Behavioral Therapy',
    phase: 'Stabilization',
    phase_progress: 40,
    risk_level: 'high',
    notes: 'Requires close monitoring. Making steady progress with MAT.',
  },
  '3': {
    id: '3',
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@email.com',
    phone: '(555) 333-4444',
    date_of_birth: '1978-11-08',
    gender: 'Male',
    facility_id: '2',
    facility_name: 'New Beginnings Treatment',
    status: 'active',
    admission_date: '2025-09-22',
    expected_discharge: '2025-11-30',
    days_in_program: 60,
    counselor_name: 'Lisa Anderson',
    counselor_id: '3',
    address: '789 Hope Ave, Houston, TX 77001',
    emergency_contact: 'Susan Brown',
    emergency_phone: '(555) 555-6666',
    emergency_relation: 'Wife',
    insurance_provider: 'United Healthcare',
    insurance_id: 'UHC-456789123',
    primary_diagnosis: 'Substance Use Disorder - Multiple',
    secondary_diagnoses: ['Bipolar Disorder'],
    treatment_plan: 'Dual Diagnosis Program',
    phase: 'Maintenance',
    phase_progress: 85,
    risk_level: 'low',
    notes: 'Excellent progress. Preparing for discharge planning.',
  },
  '4': {
    id: '4',
    first_name: 'Sarah',
    last_name: 'Davis',
    email: 'sarah.davis@email.com',
    phone: '(555) 444-5555',
    date_of_birth: '1995-02-28',
    gender: 'Female',
    facility_id: '3',
    facility_name: 'Serenity Springs',
    status: 'pending',
    admission_date: '2025-11-21',
    expected_discharge: '2025-01-21',
    days_in_program: 0,
    counselor_name: 'Dr. Kevin Park',
    counselor_id: '4',
    address: '321 Wellness Blvd, Dallas, TX 75201',
    emergency_contact: 'Mark Davis',
    emergency_phone: '(555) 666-7777',
    emergency_relation: 'Father',
    insurance_provider: 'Cigna',
    insurance_id: 'CIG-789123456',
    primary_diagnosis: 'Alcohol Use Disorder',
    secondary_diagnoses: [],
    treatment_plan: 'Standard Recovery Program',
    phase: 'Assessment',
    phase_progress: 10,
    risk_level: 'moderate',
    notes: 'New admission. Initial assessment in progress.',
  },
  '5': {
    id: '5',
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@email.com',
    phone: '(555) 555-6666',
    date_of_birth: '1982-09-12',
    gender: 'Male',
    facility_id: '2',
    facility_name: 'New Beginnings Treatment',
    status: 'discharged',
    admission_date: '2025-08-22',
    expected_discharge: '2025-11-20',
    days_in_program: 90,
    counselor_name: 'Lisa Anderson',
    counselor_id: '3',
    address: '654 Freedom Dr, Houston, TX 77002',
    emergency_contact: 'Mary Wilson',
    emergency_phone: '(555) 777-8888',
    emergency_relation: 'Mother',
    insurance_provider: 'Humana',
    insurance_id: 'HUM-321654987',
    primary_diagnosis: 'Cocaine Use Disorder',
    secondary_diagnoses: ['Depression'],
    treatment_plan: 'Intensive Outpatient Program',
    phase: 'Aftercare',
    phase_progress: 100,
    risk_level: 'low',
    notes: 'Successfully completed program. Transitioned to outpatient care.',
  },
}

const mockTimeline = [
  { id: '1', type: 'check_in', title: 'Daily Check-in Completed', date: '2025-11-21', description: 'Mood: Good, Cravings: Low' },
  { id: '2', type: 'therapy', title: 'Individual Therapy Session', date: '2025-11-20', description: 'Focus on coping strategies' },
  { id: '3', type: 'milestone', title: '30 Days Sober', date: '2025-11-06', description: 'Achieved 30-day milestone' },
  { id: '4', type: 'group', title: 'Group Therapy Session', date: '2025-11-19', description: 'Topic: Building support networks' },
  { id: '5', type: 'medical', title: 'Medical Review', date: '2025-11-15', description: 'Routine health check - all clear' },
]

export default function PatientDetailAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()

  const patient = mockPatients[id || '1']

  if (!patient) {
    return (
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400">Patient not found</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      discharged: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getRiskBadge = (risk: string) => {
    const styles: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[risk]}`}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{patient.facility_name} - Day {patient.days_in_program}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(patient.status)}
          {getRiskBadge(patient.risk_level)}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" />
            Edit Patient
          </button>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Recovery Phase: {patient.phase}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{patient.treatment_plan}</p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{patient.phase_progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${patient.phase_progress}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{patient.days_in_program}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Days in Program</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check-ins Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Therapy Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Milestones Achieved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Age / Gender</p>
                  <p className="text-gray-900 dark:text-white">{calculateAge(patient.date_of_birth)} years old, {patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(patient.date_of_birth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-gray-900 dark:text-white">{patient.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Treatment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Facility</p>
                  <p className="text-gray-900 dark:text-white">{patient.facility_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Counselor</p>
                  <p className="text-gray-900 dark:text-white">{patient.counselor_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admission Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(patient.admission_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expected Discharge</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(patient.expected_discharge)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Diagnosis & Treatment</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Primary Diagnosis</p>
                <p className="text-gray-900 dark:text-white font-medium">{patient.primary_diagnosis}</p>
              </div>
              {patient.secondary_diagnoses.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Secondary Diagnoses</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.secondary_diagnoses.map((diagnosis, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                        {diagnosis}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Treatment Plan</p>
                <p className="text-gray-900 dark:text-white">{patient.treatment_plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Clinical Notes</p>
                <p className="text-gray-600 dark:text-gray-400">{patient.notes}</p>
              </div>
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
                <p className="text-gray-900 dark:text-white">{patient.emergency_contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                <p className="text-gray-900 dark:text-white">{patient.emergency_relation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-900 dark:text-white">{patient.emergency_phone}</p>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Insurance Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
                  <p className="text-gray-900 dark:text-white">{patient.insurance_provider}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Policy ID</p>
                  <p className="text-gray-900 dark:text-white">{patient.insurance_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {mockTimeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.type === 'check_in' ? 'bg-green-100' :
                    event.type === 'therapy' ? 'bg-blue-100' :
                    event.type === 'milestone' ? 'bg-yellow-100' :
                    event.type === 'group' ? 'bg-purple-100' : 'bg-pink-100'
                  }`}>
                    {event.type === 'check_in' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {event.type === 'therapy' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                    {event.type === 'milestone' && <Activity className="w-4 h-4 text-yellow-600" />}
                    {event.type === 'group' && <User className="w-4 h-4 text-purple-600" />}
                    {event.type === 'medical' && <Heart className="w-4 h-4 text-pink-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
