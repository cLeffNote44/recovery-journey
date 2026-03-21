import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  Target,
  Calendar,
  CheckCircle,
  Star,
  AlertTriangle,
  TrendingUp,
  Award,
  Heart,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { patientsAPI } from '../services/api'
import { auditLog } from '../services/auditLog'
import {
  mockPatientDetail,
  mockTimeline,
  mockCheckIns,
  type MockPatientDetail,
  type TimelineEvent,
  type CheckIn,
} from '../data/mockData'
import { PageLoading } from '../components/LoadingState'
import { SectionErrorBoundary } from '../components/ErrorBoundary'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showFullTimeline, setShowFullTimeline] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'checkins'>('overview')
  const [patient, setPatient] = useState<MockPatientDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const response = await patientsAPI.getDashboard(id)
        if (response.success) {
          setPatient(response.patient || { ...mockPatientDetail, id })
          setTimeline(response.timeline || mockTimeline)
          setCheckIns(response.checkIns || mockCheckIns)
          setIsUsingMockData(false)
          setIsLoading(false)
          // Log PHI access for HIPAA compliance
          auditLog.patientView(id, ['name', 'status', 'diagnosis', 'timeline', 'checkins'])
          return
        }
      } catch {
        // API unavailable - will use mock data below
      }
      // Use mock data
      setPatient({ ...mockPatientDetail, id })
      setTimeline(mockTimeline)
      setCheckIns(mockCheckIns)
      setIsUsingMockData(true)
      setIsLoading(false)
      // Log PHI access even for mock data (for testing/demo)
      auditLog.patientView(id, ['name', 'status', 'diagnosis', 'timeline', 'checkins'])
    }

    fetchPatientData()
  }, [id])

  if (isLoading || !patient) {
    return <PageLoading message="Loading patient details..." />
  }

  const displayedTimeline = showFullTimeline ? timeline : timeline.slice(0, 5)

  return (
    <SectionErrorBoundary>
      <div className="animate-fadeIn">
        {/* Header */}
        <PatientHeader
          patient={patient}
          isUsingMockData={isUsingMockData}
          onBack={() => navigate('/patients')}
        />

        {/* Stats Cards */}
        <PatientStats patient={patient} />

        {/* Current Phase Progress */}
        <PhaseProgress
          phase={patient.currentPhase}
          progress={patient.phaseProgress}
        />

        {/* Tabs */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab patient={patient} checkIns={checkIns} />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            timeline={displayedTimeline}
            totalCount={timeline.length}
            showFullTimeline={showFullTimeline}
            onToggleFullTimeline={() => setShowFullTimeline(!showFullTimeline)}
          />
        )}

        {activeTab === 'checkins' && (
          <CheckInsTab checkIns={checkIns} />
        )}
      </div>
    </SectionErrorBoundary>
  )
}

// ============================================================================
// PATIENT HEADER COMPONENT
// ============================================================================

interface PatientHeaderProps {
  patient: MockPatientDetail
  isUsingMockData: boolean
  onBack: () => void
}

function PatientHeader({ patient, isUsingMockData, onBack }: PatientHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Patient Profile</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          patient.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {patient.status}
        </span>
      </div>

      {isUsingMockData && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Viewing demo data - Server connection unavailable
          </p>
        </div>
      )}
    </>
  )
}

// ============================================================================
// PATIENT STATS COMPONENT
// ============================================================================

interface PatientStatsProps {
  patient: MockPatientDetail
}

function PatientStats({ patient }: PatientStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Days Sober</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{patient.days_sober}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Check-in Streak</p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{patient.check_in_streak}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Check-ins</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{patient.total_check_ins}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">Craving Success</p>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">87%</p>
      </div>
    </div>
  )
}

// ============================================================================
// PHASE PROGRESS COMPONENT
// ============================================================================

interface PhaseProgressProps {
  phase: string
  progress: number
}

function PhaseProgress({ phase, progress }: PhaseProgressProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 mb-6 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6" />
          <div>
            <p className="text-sm opacity-80">Current Treatment Phase</p>
            <p className="text-lg font-semibold">{phase}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{progress}%</p>
          <p className="text-sm opacity-80">Complete</p>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3">
        <div
          className="bg-white rounded-full h-3 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// TAB NAVIGATION COMPONENT
// ============================================================================

interface TabNavigationProps {
  activeTab: 'overview' | 'timeline' | 'checkins'
  onTabChange: (tab: 'overview' | 'timeline' | 'checkins') => void
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'timeline' as const, label: 'Progress Timeline' },
    { id: 'checkins' as const, label: 'Check-ins' },
  ]

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB COMPONENT
// ============================================================================

interface OverviewTabProps {
  patient: MockPatientDetail
  checkIns: CheckIn[]
}

function OverviewTab({ patient, checkIns }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Patient Info */}
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-white">{patient.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white">{patient.email}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Date of Birth</p>
              <p className="text-gray-900 dark:text-white">{patient.date_of_birth}</p>
            </div>
          </div>
        </div>

        {/* Treatment Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Treatment Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Assigned Counselor</p>
              <p className="text-gray-900 dark:text-white">{patient.counselor_name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Admission Date</p>
              <p className="text-gray-900 dark:text-white">{patient.admission_date}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Sobriety Date</p>
              <p className="text-gray-900 dark:text-white">{patient.sobriety_date}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Substances</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.substances.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Middle Column - Recent Activity */}
      <div className="col-span-2">
        <RecentCheckIns checkIns={checkIns} />
      </div>
    </div>
  )
}

// ============================================================================
// QUICK ACTIONS COMPONENT
// ============================================================================

function QuickActions() {
  const actions = [
    { icon: MessageSquare, label: 'Send Message' },
    { icon: FileText, label: 'Upload Document' },
    { icon: Target, label: 'Assign Goal' },
    { icon: Calendar, label: 'Schedule Appointment' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <action.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// RECENT CHECK-INS COMPONENT
// ============================================================================

interface RecentCheckInsProps {
  checkIns: CheckIn[]
}

function RecentCheckIns({ checkIns }: RecentCheckInsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Check-ins</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {checkIns.map((checkIn, index) => (
          <div key={index} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{checkIn.date}</span>
              <MoodIndicator mood={checkIn.mood} />
            </div>
            <p className="text-gray-700 dark:text-gray-300">{checkIn.notes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MOOD INDICATOR COMPONENT
// ============================================================================

interface MoodIndicatorProps {
  mood: number
  showDots?: boolean
}

function MoodIndicator({ mood, showDots = false }: MoodIndicatorProps) {
  const moodColor = mood >= 8 ? 'text-green-600 dark:text-green-400' :
                    mood >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'

  const dotColor = mood >= 8 ? 'bg-green-500' :
                   mood >= 6 ? 'bg-yellow-500' :
                   'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Mood:</span>
      {showDots && (
        <div className="flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < mood ? dotColor : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
      <span className={`font-semibold ${moodColor}`}>{mood}/10</span>
    </div>
  )
}

// ============================================================================
// TIMELINE TAB COMPONENT
// ============================================================================

interface TimelineTabProps {
  timeline: TimelineEvent[]
  totalCount: number
  showFullTimeline: boolean
  onToggleFullTimeline: () => void
}

function TimelineTab({ timeline, totalCount, showFullTimeline, onToggleFullTimeline }: TimelineTabProps) {
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Star className="w-4 h-4" />
      case 'check-in': return <CheckCircle className="w-4 h-4" />
      case 'therapy': return <Heart className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'goal': return <Target className="w-4 h-4" />
      case 'phase': return <TrendingUp className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-yellow-500 text-white'
      case 'check-in': return 'bg-blue-500 text-white'
      case 'therapy': return 'bg-purple-500 text-white'
      case 'alert': return 'bg-orange-500 text-white'
      case 'goal': return 'bg-green-500 text-white'
      case 'phase': return 'bg-indigo-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Recovery Journey Timeline</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline events */}
        <div className="space-y-6">
          {timeline.map((event) => (
            <div key={event.id} className="relative flex gap-4 pl-12">
              {/* Icon */}
              <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${getTimelineColor(event.type)}`}>
                {getTimelineIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Show more/less button */}
        {totalCount > 5 && (
          <button
            onClick={onToggleFullTimeline}
            className="mt-6 ml-12 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
          >
            {showFullTimeline ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All ({totalCount} events)
              </>
            )}
          </button>
        )}
      </div>

      {/* Timeline Legend */}
      <TimelineLegend />
    </div>
  )
}

// ============================================================================
// TIMELINE LEGEND COMPONENT
// ============================================================================

function TimelineLegend() {
  const legendItems = [
    { icon: Star, color: 'bg-yellow-500', label: 'Milestone' },
    { icon: TrendingUp, color: 'bg-indigo-500', label: 'Phase Change' },
    { icon: Heart, color: 'bg-purple-500', label: 'Therapy' },
    { icon: Target, color: 'bg-green-500', label: 'Goal' },
    { icon: CheckCircle, color: 'bg-blue-500', label: 'Check-in' },
    { icon: AlertTriangle, color: 'bg-orange-500', label: 'Alert' },
  ]

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legend</p>
      <div className="flex flex-wrap gap-4">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center`}>
              <item.icon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// CHECK-INS TAB COMPONENT
// ============================================================================

interface CheckInsTabProps {
  checkIns: CheckIn[]
}

function CheckInsTab({ checkIns }: CheckInsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">All Check-ins</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {checkIns.map((checkIn, index) => (
          <div key={index} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{checkIn.date}</span>
              <MoodIndicator mood={checkIn.mood} showDots />
            </div>
            <p className="text-gray-700 dark:text-gray-300">{checkIn.notes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
