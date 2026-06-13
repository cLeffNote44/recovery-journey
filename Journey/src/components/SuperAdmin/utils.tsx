// Utility functions for SuperAdmin components

export const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    discharged: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    counselor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    therapist: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    case_manager: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    nurse: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    facility_admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  }
  const labels: Record<string, string> = {
    counselor: 'Counselor',
    therapist: 'Therapist',
    case_manager: 'Case Manager',
    nurse: 'Nurse',
    facility_admin: 'Admin',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
      {labels[role] || role}
    </span>
  )
}

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
