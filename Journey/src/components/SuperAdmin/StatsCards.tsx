import {
  Building2,
  Users,
  Stethoscope,
  Activity,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { DashboardStats, DashboardWidget } from './types'

interface StatsCardsProps {
  stats: DashboardStats
  visibleWidgets: DashboardWidget[]
}

interface StatCardProps {
  icon: React.ReactNode
  iconBgColor: string
  value: number
  label: string
  change: number
}

const StatCard = ({ icon, iconBgColor, value, label, change }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(change)}
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  </div>
)

export default function StatsCards({ stats, visibleWidgets }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {visibleWidgets.includes('facilities') && (
        <StatCard
          icon={<Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          value={stats.total_facilities}
          label="Total Facilities"
          change={stats.facilities_change}
        />
      )}

      {visibleWidgets.includes('staff') && (
        <StatCard
          icon={<Stethoscope className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          value={stats.total_staff}
          label="Total Staff"
          change={stats.staff_change}
        />
      )}

      {visibleWidgets.includes('patients') && (
        <StatCard
          icon={<Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          value={stats.total_patients}
          label="Total Patients"
          change={stats.patients_change}
        />
      )}

      {visibleWidgets.includes('active') && (
        <StatCard
          icon={<Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          value={stats.active_today}
          label="Active Today"
          change={stats.active_change}
        />
      )}
    </div>
  )
}
