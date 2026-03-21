import { useNavigate } from 'react-router-dom'
import { Facility } from './types'
import { getStatusBadge, formatDate } from './utils'

interface FacilitiesTableProps {
  facilities: Facility[]
  maxRows?: number
}

export default function FacilitiesTable({ facilities, maxRows = 5 }: FacilitiesTableProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Facilities Overview</h2>
        <button
          onClick={() => navigate('/facilities')}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          View All
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
            <th className="pb-3 font-medium">Facility</th>
            <th className="pb-3 font-medium">Location</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Patients</th>
            <th className="pb-3 font-medium">Staff</th>
            <th className="pb-3 font-medium">Last Active</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {facilities.slice(0, maxRows).map((facility) => (
            <tr
              key={facility.id}
              className="border-b last:border-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate(`/facility/${facility.id}`)}
            >
              <td className="py-3 font-medium text-gray-900 dark:text-white">
                {facility.name}
              </td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                {facility.city}, {facility.state}
              </td>
              <td className="py-3">{getStatusBadge(facility.status)}</td>
              <td className="py-3 text-gray-900 dark:text-white">{facility.patient_count}</td>
              <td className="py-3 text-gray-900 dark:text-white">{facility.staff_count}</td>
              <td className="py-3 text-gray-600 dark:text-gray-400">
                {formatDate(facility.last_active)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
