import { useState, lazy, Suspense } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { BottomNav } from '@/components/app/BottomNav';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search, Settings as SettingsIcon } from 'lucide-react';
import { EmergencySupportModal } from '@/components/app/EmergencySupportModal';
import { SearchModal } from '@/components/app/SearchModal';
import { NotificationCenter } from '@/components/app/NotificationCenter';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';

// Lazy load screen components for better performance
const HomeScreen = lazy(() => import('@/components/app/screens/HomeScreen').then(m => ({ default: m.HomeScreen })));
const CalendarScreen = lazy(() => import('@/components/app/screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })));
const JournalScreen = lazy(() => import('@/components/app/screens/JournalScreen').then(m => ({ default: m.JournalScreen })));
const ContactsScreen = lazy(() => import('@/components/app/screens/ContactsScreen').then(m => ({ default: m.ContactsScreen })));
const GoalsScreen = lazy(() => import('@/components/app/screens/GoalsScreen').then(m => ({ default: m.GoalsScreen })));
const PreventionScreen = lazy(() => import('@/components/app/screens/PreventionScreen').then(m => ({ default: m.PreventionScreen })));
const WellnessScreen = lazy(() => import('@/components/app/screens/WellnessScreen').then(m => ({ default: m.WellnessScreen })));
const SettingsScreen = lazy(() => import('@/components/app/screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const FacilityScreen = lazy(() => import('@/components/app/screens/FacilityScreen').then(m => ({ default: m.FacilityScreen })));
const MeetingFinderScreen = lazy(() => import('@/components/app/screens/MeetingFinderScreen').then(m => ({ default: m.MeetingFinderScreen })));

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { loading, contacts } = useAppData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">💪</div>
          <div className="text-2xl font-bold">Recover</div>
          <div className="text-sm mt-2 opacity-90">Loading your data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Header Buttons - Fixed Position */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <NotificationCenter onNavigate={setActiveTab} />
        <Button
          onClick={() => setShowSearch(true)}
          variant="outline"
          size="sm"
          aria-label="Open search"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button
          onClick={() => setActiveTab('settings')}
          variant="outline"
          size="sm"
          aria-label="Open settings"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <SettingsIcon className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button
          onClick={() => setShowEmergency(true)}
          className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
          size="sm"
          aria-label="Open emergency support resources"
        >
          <AlertCircle className="w-4 h-4 mr-2" aria-hidden="true" />
          Emergency
        </Button>
      </div>

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-2xl mx-auto p-4 pt-16 pb-24"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        role="main"
        aria-label="Main content"
      >
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          }>
            {activeTab === 'home' && (
              <FeatureErrorBoundary featureName="Home Dashboard">
                <HomeScreen
                  onNavigate={setActiveTab}
                  onEmergency={() => setShowEmergency(true)}
                />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'calendar' && (
              <FeatureErrorBoundary featureName="Calendar">
                <CalendarScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'journal' && (
              <FeatureErrorBoundary featureName="Journal">
                <JournalScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'contacts' && (
              <FeatureErrorBoundary featureName="Contacts">
                <ContactsScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'goals' && (
              <FeatureErrorBoundary featureName="Goals">
                <GoalsScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'prevention' && (
              <FeatureErrorBoundary featureName="Prevention">
                <PreventionScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'wellness' && (
              <FeatureErrorBoundary featureName="Wellness">
                <WellnessScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'facility' && (
              <FeatureErrorBoundary featureName="Facility">
                <FacilityScreen />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'meetings' && (
              <FeatureErrorBoundary featureName="Meeting Finder">
                <MeetingFinderScreen onNavigate={setActiveTab} />
              </FeatureErrorBoundary>
            )}
            {activeTab === 'settings' && (
              <FeatureErrorBoundary featureName="Settings">
                <SettingsScreen />
              </FeatureErrorBoundary>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation */}
      <nav aria-label="Main navigation">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </nav>

      {/* Emergency Modal */}
      <EmergencySupportModal
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        contacts={contacts}
        riskLevel="high"
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}

export default function AppPage() {
  return <AppContent />;
}

