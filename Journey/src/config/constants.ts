/**
 * Application-wide constants
 *
 * Centralizes magic numbers and configuration values that were previously
 * scattered throughout the codebase. Import from here to ensure consistency.
 */

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API = {
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 30000,
  /** API version prefix */
  VERSION: '/api/v1',
  /** Maximum retries for failed requests */
  MAX_RETRIES: 3,
  /** Delay between retries (multiplied by attempt number) */
  RETRY_DELAY_MS: 1000,
} as const

// =============================================================================
// AUTHENTICATION
// =============================================================================

export const AUTH = {
  /** Token expiry time in milliseconds (1 hour) */
  TOKEN_EXPIRY_MS: 3600000,
  /** Buffer before expiry to trigger refresh (30 seconds) */
  TOKEN_REFRESH_BUFFER_MS: 30000,
  /** Storage key for auth data */
  STORAGE_KEY: 'auth-storage',
} as const

// =============================================================================
// UI TIMING
// =============================================================================

export const UI = {
  /** Toast notification display duration */
  TOAST_DURATION_MS: 5000,
  /** Search input debounce delay */
  DEBOUNCE_DELAY_MS: 300,
  /** Animation duration for transitions */
  ANIMATION_DURATION_MS: 200,
  /** Skeleton loading minimum display time */
  SKELETON_MIN_DISPLAY_MS: 500,
} as const

// =============================================================================
// PAGINATION
// =============================================================================

export const PAGINATION = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 10,
  /** Available page size options */
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  /** Maximum items to fetch in a single request */
  MAX_PAGE_SIZE: 100,
} as const

// =============================================================================
// VALIDATION LIMITS
// =============================================================================

export const VALIDATION = {
  /** Name fields */
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
  /** Message/text content */
  MESSAGE_MAX_LENGTH: 5000,
  DESCRIPTION_MAX_LENGTH: 500,
  /** Phone numbers */
  PHONE_MIN_DIGITS: 10,
  PHONE_MAX_DIGITS: 15,
  /** Age limits */
  AGE_MIN: 13,
  AGE_MAX: 120,
  /** Address */
  ADDRESS_MAX_LENGTH: 200,
  /** Password */
  PASSWORD_MIN_LENGTH: 8,
} as const

// =============================================================================
// FILE UPLOADS
// =============================================================================

export const FILE_UPLOAD = {
  /** Maximum file size in bytes (10MB) */
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  /** Allowed document MIME types */
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ] as const,
  /** Allowed image MIME types */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
} as const

// =============================================================================
// DATE/TIME FORMATS
// =============================================================================

export const DATE_FORMATS = {
  /** Display format for dates */
  DISPLAY: 'MMM d, yyyy',
  /** Display format for date and time */
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  /** ISO format for API requests */
  API: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  /** Short date format */
  SHORT: 'MM/dd/yyyy',
} as const

// =============================================================================
// STATUS COLORS (Tailwind classes)
// =============================================================================

export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  },
} as const

// =============================================================================
// PATIENT STATUS
// =============================================================================

export const PATIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DISCHARGED: 'discharged',
} as const

export type PatientStatus = (typeof PATIENT_STATUS)[keyof typeof PATIENT_STATUS]

// =============================================================================
// TIMELINE EVENT TYPES (for PatientDetail)
// =============================================================================

export const TIMELINE_COLORS = {
  milestone: 'bg-yellow-500',
  phaseChange: 'bg-indigo-500',
  appointment: 'bg-blue-500',
  assessment: 'bg-purple-500',
  note: 'bg-gray-500',
  alert: 'bg-red-500',
} as const
