interface AnalyticsSectionProps {
  showAnalytics: boolean
  showCharts: boolean
}

interface MetricCardProps {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}

const MetricCard = ({ label, value, change, changeType }: MetricCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {change}
    </p>
  </div>
)

interface ChartPlaceholderProps {
  title: string
}

const ChartPlaceholder = ({ title }: ChartPlaceholderProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">Chart coming soon</p>
    </div>
  </div>
)

export default function AnalyticsSection({ showAnalytics, showCharts }: AnalyticsSectionProps) {
  return (
    <>
      {showAnalytics && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Avg. Patients per Facility"
            value="70.2"
            change="+5.3% from last month"
            changeType="positive"
          />
          <MetricCard
            label="Avg. Length of Stay"
            value="42 days"
            change="+2 days from last month"
            changeType="positive"
          />
          <MetricCard
            label="Completion Rate"
            value="78%"
            change="+3% from last month"
            changeType="positive"
          />
          <MetricCard
            label="Check-in Compliance"
            value="91%"
            change="-1% from last month"
            changeType="negative"
          />
        </div>
      )}

      {showCharts && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <ChartPlaceholder title="Patient Admissions Over Time" />
            <ChartPlaceholder title="Facility Comparison" />
          </div>
          <ChartPlaceholder title="Staff Workload Distribution" />
        </>
      )}
    </>
  )
}
