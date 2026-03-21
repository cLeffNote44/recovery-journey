import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { ErrorBoundary, SectionErrorBoundary } from './components/ErrorBoundary'
import { PageLoadingState } from './components/LoadingState'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'

// Lazy load route components for code splitting
// Core pages loaded immediately, less common pages lazy loaded
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const PatientDetail = lazy(() => import('./pages/PatientDetail'))
const Messages = lazy(() => import('./pages/Messages'))
const Settings = lazy(() => import('./pages/Settings'))
const TreatmentPlans = lazy(() => import('./pages/TreatmentPlans'))
const Documents = lazy(() => import('./pages/Documents'))
const Appointments = lazy(() => import('./pages/Appointments'))

// Super Admin pages (separate chunk)
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'))
const FacilityDetail = lazy(() => import('./pages/SuperAdmin/FacilityDetail'))
const StaffDetail = lazy(() => import('./pages/StaffDetail'))
const AdminDetail = lazy(() => import('./pages/AdminDetail'))
const PatientDetailAdmin = lazy(() => import('./pages/PatientDetailAdmin'))

function App() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    )
  }

  // Super Admin sees different interface
  const isSuperAdmin = user?.role === 'super_admin'

  return (
    <ErrorBoundary>
      <Layout>
        <SectionErrorBoundary>
          <Suspense fallback={<PageLoadingState />}>
            <Routes>
              {isSuperAdmin ? (
                <>
                  <Route path="/" element={<SuperAdminDashboard initialTab="overview" />} />
                  <Route path="/facilities" element={<SuperAdminDashboard initialTab="facilities" />} />
                  <Route path="/facility/:id" element={<FacilityDetail />} />
                  <Route path="/administrators" element={<SuperAdminDashboard initialTab="administrators" />} />
                  <Route path="/admin/:id" element={<AdminDetail />} />
                  <Route path="/clinicians" element={<SuperAdminDashboard initialTab="clinicians" />} />
                  <Route path="/staff/:id" element={<StaffDetail />} />
                  <Route path="/patients" element={<SuperAdminDashboard initialTab="patients" />} />
                  <Route path="/patient/:id" element={<PatientDetailAdmin />} />
                  <Route path="/treatment-plans" element={<TreatmentPlans />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/treatment-plans" element={<TreatmentPlans />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </Suspense>
        </SectionErrorBoundary>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
