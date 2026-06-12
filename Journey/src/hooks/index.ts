// Custom hooks for the Recover Clinician Portal

// Utility hooks
export { useDebounce, useDebouncedCallback } from './useDebounce'
export { useFetch, useFetchWithRetry } from './useFetch'
export { useLocalStorage, useSessionStorage } from './useLocalStorage'

// Security & Compliance hooks
export {
  useSessionTimeout,
  formatRemainingTime,
  type SessionTimeoutConfig,
  type SessionTimeoutState,
} from './useSessionTimeout'

export {
  useUnsavedChanges,
  useBeforeUnload,
  useFormDirtyState,
  type UnsavedChangesConfig,
  type UnsavedChangesState,
} from './useUnsavedChanges'

export {
  useServiceWorker,
  useOnlineStatus,
  type ServiceWorkerState,
  type ServiceWorkerActions,
  type QueuedRequest,
} from './useServiceWorker'

export {
  useWebSocket,
  useTypingIndicator,
  useWebSocketSubscription,
  useWebSocketStatus,
} from './useWebSocket'

export {
  usePagination,
  generatePageNumbers,
  formatPaginationRange,
  type PaginationParams,
  type PaginatedResponse,
  type UsePaginationOptions,
  type UsePaginationReturn,
} from './usePagination'

// Error handling
export {
  useApiError,
  parseApiError,
  isApiErrorType,
  hasFieldError,
  getFieldError,
  getAllFieldErrors,
  type ApiError,
} from './useApiError'

// React Query hooks for data fetching with caching
export {
  usePatients,
  usePatient,
  usePatientDashboard,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useRegeneratePatientKey,
} from './usePatients'

export {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkMessageAsRead,
} from './useMessages'

export {
  useFacilityDashboard,
} from './useDashboard'

export {
  useTreatmentPlans,
  useCreateTreatmentPlan,
  useUpdateTreatmentPlan,
  useAssignTreatmentPlan,
  useArchiveTreatmentPlan,
  toCreatePayload,
  toBackendUnit,
  toBackendStatus,
  mockTreatmentPlans,
} from './useTreatmentPlans'

// Admin hooks (SuperAdmin functionality)
export {
  useAdminStats,
  useAdminFacilities,
  useAdminFacility,
  useCreateFacility,
  useUpdateFacility,
  useSuspendFacility,
  useAdminAdministrators,
  useCreateAdministrator,
  useCreateClinician,
  useResetAdminPassword,
  useAdminClinicians,
  useAdminPatients,
  useAdminAnalytics,
  useAdminActivity,
} from './useAdmin'

// HIPAA Compliance - Audit Logging hook
export { useAuditLog } from '../services/auditLog'
