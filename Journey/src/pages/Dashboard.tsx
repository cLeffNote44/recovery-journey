import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { facilityAPI } from '../services/api'
import {
  mockDashboardStats,
  mockAppointments,
  mockDashboardMessages,
  mockReminders,
  type DashboardStats,
  type Appointment,
  type DashboardMessage,
  type Reminder,
} from '../data/mockData'
import {
  DashboardStatsSkeleton,
  CardSkeleton,
  Skeleton,
} from '../components/LoadingState'
import { SectionErrorBoundary } from '../components/ErrorBoundary'

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [messages, setMessages] = useState<DashboardMessage[]>(mockDashboardMessages)
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders)
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [hasError, setHasError] = useState(false)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      if (user?.facility_id) {
        const response = await facilityAPI.getDashboard(user.facility_id)
        if (response.success) {
          setStats(response.stats || mockDashboardStats)
          setAppointments(response.appointments || mockAppointments)
          setMessages(response.messages || mockDashboardMessages)
          setReminders(response.reminders || mockReminders)
          setIsUsingMockData(false)
          return
        }
      }
      // Use mock data
      setIsUsingMockData(true)
    } catch {
      // API unavailable - using mock data
      setIsUsingMockData(true)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user?.facility_id])

  const getReminderIcon = (iconType: string) => {
    switch (iconType) {
      case 'clipboard':
        return ClipboardCheck
      case 'users':
        return Users
      case 'alert':
        return AlertTriangle
      default:
        return ClipboardCheck
    }
  }

  return (
    <SectionErrorBoundary>
      <div className="animate-fadeIn space-y-6">
        {/* Welcome Banner */}
        <div className="bg-primary-600 text-white rounded-xl p-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.first_name || 'Clinician'}!
          </h1>
          <p className="text-primary-100 mt-1">
            Here's an overview of your facility's activity today.
          </p>
          {isUsingMockData && !isLoading && (
            <div className="flex items-center gap-3 mt-2">
              <p className="text-primary-200 text-sm">
                {hasError ? 'Server connection unavailable -' : ''} Viewing demo data
              </p>
              {hasError && (
                <button
                  onClick={fetchDashboardData}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              subtitle={`${stats.activePatients} active`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Check-ins Today"
              value={stats.checkInsToday}
              subtitle={`out of ${stats.activePatients} active`}
              icon={ClipboardCheck}
              color="green"
            />
            <StatCard
              title="Alerts"
              value={stats.alertsCount}
              subtitle="needs attention"
              icon={AlertTriangle}
              color="yellow"
            />
            <StatCard
              title="Avg. Days Sober"
              value={stats.avgDaysSober}
              subtitle="across all patients"
              icon={TrendingUp}
              color="purple"
            />
          </div>
        )}

        {/* Reminders */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Reminders</h2>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {reminders.map((reminder) => {
                const Icon = getReminderIcon(reminder.iconType)
                return (
                  <div
                    key={reminder.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{reminder.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reminder.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-400">
                        {apt.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{apt.patient}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{apt.date} at {apt.time}</p>
                      </div>
                      <span className={`badge ${
                        apt.status === 'confirmed' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => navigate('/appointments')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                  >
                    View all appointments
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
              <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full font-medium">
                {messages.length} new
              </span>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => navigate('/messages')}
                      className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">{msg.from}</p>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{msg.preview}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => navigate('/messages')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                  >
                    View all messages
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SectionErrorBoundary>
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
