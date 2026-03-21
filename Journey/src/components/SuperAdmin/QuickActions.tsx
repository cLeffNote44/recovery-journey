import { Building2, UserCog, Download, ChevronRight } from 'lucide-react'

interface QuickActionsProps {
  onAddFacility: () => void
  onAddAdmin: () => void
  onExportReport: () => void
}

interface ActionButtonProps {
  icon: React.ReactNode
  iconBgColor: string
  title: string
  description: string
  onClick: () => void
}

const ActionButton = ({ icon, iconBgColor, title, description, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
  >
    <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
      {icon}
    </div>
    <div className="text-left">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
  </button>
)

export default function QuickActions({ onAddFacility, onAddAdmin, onExportReport }: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <ActionButton
          icon={<Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          title="Add Facility"
          description="Create new facility"
          onClick={onAddFacility}
        />
        <ActionButton
          icon={<UserCog className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          title="Add Administrator"
          description="Create new admin"
          onClick={onAddAdmin}
        />
        <ActionButton
          icon={<Download className="w-5 h-5 text-green-600 dark:text-green-400" />}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          title="Export Report"
          description="Download system report"
          onClick={onExportReport}
        />
      </div>
    </div>
  )
}
