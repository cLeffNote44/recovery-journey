import { useState } from 'react'
import { Search, Bell } from 'lucide-react'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header
      className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 drag-region transition-colors"
      role="banner"
    >
      {/* Search */}
      <div className="flex items-center gap-4 no-drag">
        <div className="relative">
          <label htmlFor="global-search" className="sr-only">
            Search patients
          </label>
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-describedby="search-help"
          />
          <span id="search-help" className="sr-only">
            Type to search for patients by name, email, or ID
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 no-drag" role="group" aria-label="Header actions">
        {/* Notifications */}
        <button
          className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Notifications - you have unread notifications"
          aria-haspopup="true"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span
            className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  )
}
