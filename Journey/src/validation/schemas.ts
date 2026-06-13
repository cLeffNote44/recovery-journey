import { z } from 'zod'

// ============================================================================
// PATIENT VALIDATION SCHEMAS
// ============================================================================

export const patientFormSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
      const maxAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate())
      return parsed >= minAge && parsed <= maxAge
    }, 'Patient must be between 13 and 120 years old'),

  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      // Accept various phone formats
      const cleaned = val.replace(/[\s\-().]/g, '')
      return /^\+?[0-9]{10,15}$/.test(cleaned)
    }, 'Please enter a valid phone number'),

  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      return z.string().email().safeParse(val).success
    }, 'Please enter a valid email address'),

  sobriety_date: z
    .string()
    .min(1, 'Sobriety date is required')
    .refine((date) => {
      const parsed = new Date(date)
      const now = new Date()
      return parsed <= now
    }, 'Sobriety date cannot be in the future'),
})

export type PatientFormData = z.infer<typeof patientFormSchema>

// ============================================================================
// LOGIN VALIDATION SCHEMA
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================================================
// MESSAGE VALIDATION SCHEMA
// ============================================================================

export const messageSchema = z.object({
  text: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters'),
})

export type MessageFormData = z.infer<typeof messageSchema>

// ============================================================================
// FACILITY VALIDATION SCHEMA (Super Admin)
// ============================================================================

export const facilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Facility name is required')
    .max(100, 'Facility name must be less than 100 characters'),

  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),

  state: z
    .string()
    .min(2, 'State is required')
    .max(50, 'State must be less than 50 characters'),

  zip: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),

  phone: z
    .string()
    .min(1, 'Phone is required')
    .refine((val) => {
      const cleaned = val.replace(/[\s\-().]/g, '')
      return /^\+?[0-9]{10,15}$/.test(cleaned)
    }, 'Please enter a valid phone number'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  license_number: z
    .string()
    .optional(),
})

export type FacilityFormData = z.infer<typeof facilitySchema>

// ============================================================================
// TWO-FACTOR AUTHENTICATION SCHEMAS
// ============================================================================

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
})

export type TwoFactorVerifyData = z.infer<typeof twoFactorVerifySchema>

export const twoFactorDisableSchema = z.object({
  code: z
    .string()
    .length(6, 'Authenticator code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Authenticator code must contain only digits'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type TwoFactorDisableData = z.infer<typeof twoFactorDisableSchema>

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  for (const error of result.error.issues) {
    const path = error.path.join('.')
    if (!errors[path]) {
      errors[path] = error.message
    }
  }

  return { success: false, errors }
}

// Hook-friendly validation
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateForm(schema, data),
    validateField: (field: string, value: unknown) => {
      const result = schema.safeParse({ [field]: value })
      if (result.success) return null
      const fieldError = result.error.issues.find(
        (issue: z.ZodIssue) => issue.path.join('.') === field
      )
      return fieldError?.message || null
    },
  }
}
