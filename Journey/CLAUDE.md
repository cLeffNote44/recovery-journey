# CLAUDE.md - AI Assistant Guide for Recover Clinician Portal

## Project Overview

**Recover Clinician Portal** is a cross-platform desktop application for rehabilitation facility staff to manage patients, communicate with them, and track recovery progress. Built on Electron with React/TypeScript, designed to pair with a React Native mobile app for patients.

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start development (Vite + Electron)
npm run test       # Run tests (watch mode)
npm run test:run   # Run tests (single run) - 395 tests
npm run build      # Build for production
npm run package    # Create distributable packages
```

## Architecture

### Tech Stack
- **Runtime**: Electron 28+ (desktop)
- **Frontend**: React 18 + TypeScript 5.3
- **Build**: Vite 5 for fast HMR
- **Styling**: Tailwind CSS (blue theme with dark mode)
- **State**: Zustand with persist middleware
- **Data Fetching**: React Query (@tanstack/react-query) for caching
- **Validation**: Zod schemas
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **API**: Axios with token refresh handling

### Key Directories

```
src/
├── components/        # Reusable UI components
│   ├── SuperAdmin/    # Admin dashboard components (modular)
│   ├── ui/            # Reusable UI library (Modal, Table, Form, Card, Pagination)
│   ├── Patients/      # Patient-related components (NewPatientModal)
│   ├── ErrorBoundary.tsx      # Crash protection & API error display
│   ├── LoadingState.tsx       # Skeleton loaders
│   ├── Toast.tsx              # Toast notifications
│   ├── SessionTimeoutWarning.tsx  # HIPAA session timeout modal
│   ├── OfflineIndicator.tsx   # Offline/sync status components
│   └── UnsavedChangesDialog.tsx   # Navigation blocking dialog
├── config/
│   └── env.ts         # Environment validation (startup checks)
├── hooks/             # Custom React hooks
│   ├── index.ts       # Barrel exports (all hooks)
│   ├── useDebounce.ts # Search debouncing
│   ├── usePatients.ts # React Query patient hooks (with optimistic updates)
│   ├── useMessages.ts # React Query message hooks (with optimistic updates)
│   ├── useDashboard.ts # React Query dashboard hooks
│   ├── useAdmin.ts    # SuperAdmin hooks
│   ├── useSessionTimeout.ts   # HIPAA-compliant session timeout
│   ├── useUnsavedChanges.ts   # Form dirty state & navigation blocking
│   ├── useServiceWorker.ts    # Offline support & sync status
│   ├── useWebSocket.ts        # Real-time messaging
│   ├── usePagination.ts       # Server-side pagination
│   ├── useApiError.ts         # API error handling utilities
│   ├── useFetch.ts            # Base fetch hook with retry
│   └── useLocalStorage.ts     # Persistent storage hooks
├── lib/
│   ├── queryClient.ts # React Query config + query keys
│   ├── sentry.ts      # Error tracking integration
│   └── sanitize.ts    # Rich text sanitization (DOMPurify)
├── pages/             # Route components
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── PatientDetail.tsx  # Modular sub-components
│   ├── Messages.tsx
│   ├── Documents.tsx      # Rich text editor with TipTap
│   ├── Settings.tsx       # Complete settings with profile/notifications/security
│   ├── Appointments.tsx
│   ├── TreatmentPlans.tsx
│   └── SuperAdmin/        # Admin pages (Dashboard, Facilities, etc.)
├── services/
│   ├── api.ts         # Axios instance with interceptors
│   ├── auditLog.ts    # HIPAA-compliant audit logging + useAuditLog hook
│   └── websocket.ts   # WebSocket service for real-time
├── stores/
│   ├── authStore.ts   # Auth with secure token storage + audit logging
│   └── themeStore.ts  # Dark mode persistence
├── validation/
│   └── schemas.ts     # Zod validation schemas
├── data/
│   └── mockData.ts    # Centralized mock data for offline/demo mode
├── test/
│   ├── setup.ts       # Vitest configuration
│   └── test-utils.tsx # Custom render with providers
public/
└── sw.js              # Service Worker for offline support
electron/
├── main.ts            # Electron main process with auto-updater
└── preload.ts         # IPC bridge to renderer
e2e/
├── auth.spec.ts           # E2E authentication flows (8 tests)
├── patients.spec.ts       # E2E patient management flows (9 tests)
├── messages.spec.ts       # E2E messaging functionality (8 tests)
├── documents.spec.ts      # E2E document management (21 tests)
├── treatment-plans.spec.ts # E2E treatment plan CRUD (26 tests)
├── settings.spec.ts       # E2E settings & preferences (37 tests)
└── error-handling.spec.ts # E2E error recovery scenarios (8 tests)
```

## Code Patterns

### Data Fetching with React Query

```typescript
// Preferred: Use React Query hooks with automatic caching
import { usePatients, usePatient, useCreatePatient } from '../hooks'

// List with filters
const { data, isLoading, error } = usePatients({ status: 'active' })

// Single item
const { data: patient } = usePatient(patientId)

// Mutations with automatic cache invalidation
const { mutate: createPatient, isPending } = useCreatePatient()
```

Query keys are centralized in `src/lib/queryClient.ts` for consistent cache invalidation.

### Form Validation with Zod

```typescript
import { validateForm, patientFormSchema } from '../validation/schemas'

const result = validateForm(patientFormSchema, formData)
if (result.success) {
  // result.data is typed and validated
} else {
  // result.errors is Record<string, string>
}
```

### State Management (Zustand)

```typescript
// Stores use persist middleware with sessionStorage
// Tokens are kept in memory only (not persisted to storage)
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,  // Memory only
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }), // Exclude tokens
    }
  )
)
```

### Search with Debouncing

```typescript
import { useDebounce } from '../hooks'

const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

// Use debouncedSearch in useEffect or query
useEffect(() => {
  fetchResults(debouncedSearch)
}, [debouncedSearch])
```

### Component Structure
- Functional components with hooks
- Props interfaces defined above components
- ErrorBoundary wraps major sections for crash protection
- Loading states use skeleton loaders from `<LoadingState />`
- Toast notifications via `showToast.success/error/warning()`

## Security & HIPAA Compliance

### Token Security
- **Token Storage**: Access/refresh tokens stored in memory only, NOT localStorage
- **Session Storage**: Used for persisted auth state (user info only)
- **Token Refresh**: Handled automatically by Axios interceptors with mutex pattern
- **IPC Security**: contextBridge isolates renderer from Node.js APIs
- **Environment Validation**: API URLs validated at startup via `src/config/env.ts`

### HIPAA Compliance Features

#### Session Timeout (Auto-Logout)
```typescript
import { useSessionTimeout } from '../hooks'

// Hook automatically logs out after 15 min inactivity with 2 min warning
const { isWarningVisible, remainingTime, extendSession, logout } = useSessionTimeout({
  timeoutDuration: 15 * 60 * 1000,  // 15 minutes
  warningDuration: 2 * 60 * 1000,   // 2 minute warning
})
```

The `<SessionTimeoutWarning />` component is integrated into the Layout and displays automatically.

#### Audit Logging
```typescript
import { auditLog } from '../services/auditLog'
// Or use the hook:
import { useAuditLog } from '../hooks'

// Log PHI access
auditLog.patientView('patient-123', ['name', 'dob', 'diagnosis'])
auditLog.patientSearch('Smith', 5)
auditLog.patientListView({ status: 'active' })
auditLog.conversationView('patient-123')
auditLog.messageSend('patient-123')
auditLog.patientCreate('patient-123')

// Log data exports
auditLog.dataExport('patients', 100, { status: 'active' })

// Authentication events logged automatically via authStore
```

Audit logs track: user ID, timestamp, action type, resource accessed, PHI fields viewed, and client context. Logs are queued and batch-sent to the server every 5 seconds, with critical events (login, logout, create, delete) sent immediately.

#### Rich Text Sanitization
```typescript
import { sanitizeRichText, sanitizeMessage, stripHtml } from '../lib/sanitize'

// Sanitize before saving to database
const safeHtml = sanitizeRichText(editorContent)

// Strip all HTML for plain text
const plainText = stripHtml(htmlContent)

// Check for dangerous content
import { containsDangerousContent } from '../lib/sanitize'
if (containsDangerousContent(userInput)) {
  // Handle potentially malicious content
}
```

### Unsaved Changes Protection
```typescript
import { useUnsavedChanges, useBeforeUnload, useFormDirtyState } from '../hooks'

// Track form dirty state
const { isDirty, resetDirtyState } = useFormDirtyState(initialData, formData)

// Simple browser close warning
useBeforeUnload(isDirty)

// Full navigation blocking with React Router
const { isBlocked, proceed, reset } = useUnsavedChanges({
  hasUnsavedChanges: isDirty,
  message: 'You have unsaved changes. Leave anyway?',
})
```

## Testing

```bash
npm run test           # Watch mode
npm run test:run       # Single run (395 unit tests)
npm run test:coverage  # With coverage report
npm run test:e2e       # End-to-end tests with Playwright (117 E2E tests)
npm run test:e2e:ui    # E2E tests with interactive UI
npm run test:e2e:headed # E2E tests with visible browser
npm run test:all       # Run unit + E2E tests (512 total tests)
```

### Test Structure
- `authStore.test.ts` - Authentication state management (17 tests)
- `api.test.ts` - API service layer (16 tests)
- `LoginPage.test.tsx` - Login form component (16 tests)
- `Dashboard.test.tsx` - Dashboard page tests (11 tests)
- `PatientDetail.test.tsx` - Patient detail page tests (10 tests)
- `ErrorBoundary.test.tsx` - API error boundary components (45 tests)
- `schemas.test.ts` - Validation schemas (27 tests)
- `sanitize.test.ts` - HTML sanitization (51 tests)
- `auditLog.test.ts` - Audit logging service (18 tests)
- `useSessionTimeout.test.ts` - Session timeout hook (18 tests)
- `useUnsavedChanges.test.ts` - Unsaved changes hooks (14 tests)
- `useDebounce.test.ts` - Debounce hooks (10 tests)
- `usePatients.test.tsx` - Patient hooks (16 tests)
- `useMessages.test.tsx` - Message hooks (13 tests)
- `useDashboard.test.tsx` - Dashboard hooks (11 tests)
- `useAdmin.test.tsx` - Admin hooks (20 tests)
- `usePagination.test.tsx` - Pagination hook (24 tests)
- `useApiError.test.ts` - API error handling (29 tests)
- `useLocalStorage.test.ts` - Storage hooks (19 tests)
- `useFetch.test.ts` - Fetch hooks (10 tests)

### E2E Test Structure (117 tests)
End-to-end tests use Playwright and are located in `e2e/`:
- `auth.spec.ts` - Login page, validation, keyboard navigation (8 tests)
- `patients.spec.ts` - Patient list, search, new patient modal, filters (9 tests)
- `messages.spec.ts` - Conversation list, compose, message display (8 tests)
- `documents.spec.ts` - Categories, upload, view modes, document editor (21 tests)
- `treatment-plans.spec.ts` - Plan CRUD, phases, assignment, stats (26 tests)
- `settings.spec.ts` - Appearance, profile, notifications, security, password (37 tests)
- `error-handling.spec.ts` - Network errors, session expiry, loading states (8 tests)

### Test Utilities
```typescript
import { render, screen } from '@/test/test-utils'
// Custom render includes Router, QueryClientProvider with v7 future flags
```

### E2E Test Patterns
```typescript
// Authentication setup for E2E tests
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-user-1',
      email: 'clinician@recover.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'counselor',
      facility_id: 'facility-1',
    }
    sessionStorage.setItem('auth-storage', JSON.stringify({
      state: { user: mockUser, isAuthenticated: true },
      version: 0,
    }))
  })
  await page.goto('/target-page')
})
```

## Environment Configuration

Environment variables are validated at startup. Configure via `.env`:

```env
# Required
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws

# Error Tracking (optional)
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=development

# Feature Flags
VITE_DEBUG=false
VITE_DEMO_MODE=false
```

Environment-specific files:
- `.env.example` - Template with all available options
- `.env.staging` - Staging environment settings
- `.env.production` - Production environment settings

### Error Tracking (Sentry)

Sentry is configured in `src/lib/sentry.ts`:
```typescript
import { captureError, setSentryUser } from '../lib/sentry'

// Capture custom errors
captureError(new Error('Something went wrong'), { userId: '123' })

// Set user context (automatically done on login)
setSentryUser({ id: '123', email: 'user@example.com', role: 'counselor' })
```

Falls back to localhost in development mode with a console warning.

## Build & Distribution

```bash
npm run package        # All platforms
npm run package:mac    # macOS (.dmg)
npm run package:win    # Windows (.exe)
npm run package:linux  # Linux (.AppImage, .deb)
```

Auto-update configured via `electron-updater` publishing to GitHub releases.

### Build Output (Code Splitting)
The production build uses intelligent code splitting:
- Main bundle: ~77KB
- Vendor bundles split by category (react, query, ui, utils)
- TipTap editor lazy-loaded: ~434KB (only for Documents page)
- Total initial load optimized for fast startup

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Sidebar.tsx`

### Adding a New React Query Hook
1. Create in `src/hooks/use[Feature].ts`
2. Add query keys to `src/lib/queryClient.ts`
3. Export from `src/hooks/index.ts`

### Adding Form Validation
1. Add Zod schema to `src/validation/schemas.ts`
2. Export type: `export type MyFormData = z.infer<typeof mySchema>`
3. Use `validateForm(schema, data)` in component

### Adding API Endpoints
1. Add methods to `src/services/api.ts`
2. Create corresponding React Query hook in `src/hooks/`

### Adding Audit Logging to a Page
```typescript
import { auditLog } from '../services/auditLog'
// Or: import { useAuditLog } from '../hooks'

// In useEffect after data loads:
useEffect(() => {
  if (data) {
    auditLog.patientView(id, ['name', 'status', 'diagnosis'])
  }
}, [data, id])
```

## Mock Data Behavior

When the API is unavailable, the app falls back to mock data with a visual indicator:
- Yellow warning banner appears on affected pages
- `isFromApi` flag in query results indicates data source
- Mock data defined in `src/data/mockData.ts`

This allows frontend development to proceed independently of backend availability.

## Performance & Optimization

### Code Splitting
Routes are lazy-loaded using `React.lazy()` and `Suspense`:
- Main bundle reduced to ~77KB
- TipTap editor loaded separately (~434KB, only for Documents page)
- Vendor chunks split: react, query, ui, utils, editor

### React Query Performance Monitoring
Development-only monitoring available in `src/lib/queryClient.ts`:
```typescript
import { logQueryPerformance, getQueryPerformanceStats } from '../lib/queryClient'

// Log performance stats to console
logQueryPerformance()

// Get programmatic access to stats
const stats = getQueryPerformanceStats()
// { totalQueries, avgDuration, cacheHitRate, errorRate, slowQueries }
```

### API Error Handling
Granular error boundaries in `src/components/ErrorBoundary.tsx`:
```typescript
import { ApiErrorDisplay, getApiErrorType } from '../components/ErrorBoundary'

// Determine error type from status code or error message
const errorType = getApiErrorType(error, response?.status)
// 'network' | 'timeout' | 'unauthorized' | 'forbidden' | 'not_found' | 'server' | 'unknown'

// Display appropriate error UI
<ApiErrorDisplay type={errorType} onRetry={refetch} />
```

## Accessibility

Components follow WCAG 2.1 guidelines:
- `aria-current="page"` on active navigation links
- `aria-hidden="true"` on decorative icons
- `role="status"` with `aria-live="polite"` on loading states
- Screen reader-only labels with `.sr-only` class
- Keyboard navigation support
- Focus management in modals

## Offline Support & Real-Time Features

### Service Worker (Offline Support)
The app includes a Service Worker (`public/sw.js`) that provides:
- **Cache-first** for static assets (JS, CSS, images)
- **Network-first** for API requests with offline fallback
- **Request queuing** for mutations when offline (stored in IndexedDB)
- **Background sync** when connection is restored

```typescript
import { useServiceWorker, useOnlineStatus } from '../hooks'

const { isOnline, queuedRequestCount, hasUpdate, update, forceSync } = useServiceWorker()

// Simple online status check
const isOnline = useOnlineStatus()
```

Components `<OfflineIndicator />`, `<OfflineBanner />`, and `<UpdatePrompt />` are integrated into Layout.

### WebSocket (Real-Time Messaging)
```typescript
import { useWebSocket, useTypingIndicator } from '../hooks'

// Subscribe to real-time events
const { isConnected, send, subscribe } = useWebSocket()

// Typing indicators for chat
const { isTyping, startTyping, stopTyping } = useTypingIndicator(patientId)
```

### Reusable UI Components
Located in `src/components/ui/`:

```typescript
import { Modal, ConfirmModal } from '../components/ui/Modal'
import { Table, StatusBadge } from '../components/ui/Table'
import { FormField, Input, Button, Select } from '../components/ui/Form'
import { Card, StatCard, CardGrid } from '../components/ui/Card'
import { Pagination } from '../components/ui/Pagination'
```

## Dark Mode

Dark mode is fully supported using Tailwind's `dark:` prefix:
- Theme state persisted in `themeStore`
- Toggle available in Settings page
- All components have dark variants
- System preference detection supported

## Known Considerations

- React Query devtools available in development (bottom-right corner)
- SuperAdmin components are modular in `src/components/SuperAdmin/`
- PatientDetail is split into 12 focused sub-components
- React Router v7 future flags enabled for smooth migration
- Service Worker only registers in production (`import.meta.env.PROD`)
- Session timeout warning appears 2 minutes before auto-logout
- All dark mode styles use Tailwind `dark:` prefix
- Logout function requires reason parameter: `logout('manual')`, `logout('session_timeout')`, or `logout('forced')`
