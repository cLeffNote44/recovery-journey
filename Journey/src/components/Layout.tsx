import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { SessionTimeoutWarning } from './SessionTimeoutWarning'
import { OfflineIndicator, OfflineBanner, UpdatePrompt } from './OfflineIndicator'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Offline Banner - shows at top when offline */}
        <OfflineBanner />

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Session Timeout Warning - HIPAA compliance */}
      <SessionTimeoutWarning />

      {/* Offline/Sync Status Indicator */}
      <OfflineIndicator />

      {/* App Update Prompt */}
      <UpdatePrompt />
    </div>
  )
}
