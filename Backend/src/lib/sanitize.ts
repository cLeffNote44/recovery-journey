/**
 * Input Sanitization Library
 *
 * Provides utilities for sanitizing user input to prevent XSS attacks
 * and other injection vulnerabilities while preserving legitimate content.
 *
 * HIPAA Note: Sanitization helps protect the integrity of PHI by preventing
 * malicious code injection into patient records.
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Remove potentially dangerous HTML tags and attributes
 * This is a simple approach - for rich text, use a library like DOMPurify
 */
export function stripHtml(str: string): string {
  // Remove script tags and their content
  let result = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove style tags and their content
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove all HTML tags
  result = result.replace(/<[^>]*>/g, '')

  // Remove event handlers that might have slipped through
  result = result.replace(/on\w+\s*=/gi, '')

  // Remove javascript: URLs
  result = result.replace(/javascript:/gi, '')

  // Remove data: URLs (potential XSS vector)
  result = result.replace(/data:/gi, 'data-blocked:')

  return result.trim()
}

/**
 * Sanitize a string for safe storage and display
 * Removes HTML but preserves the text content
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Strip HTML tags and dangerous content
  let result = stripHtml(input)

  // Normalize whitespace (collapse multiple spaces/newlines)
  result = result.replace(/\s+/g, ' ')

  // Trim
  result = result.trim()

  return result
}

/**
 * Sanitize a string but preserve newlines (for notes/content fields)
 */
export function sanitizeMultilineString(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Strip HTML tags and dangerous content
  let result = stripHtml(input)

  // Normalize spaces but preserve newlines
  result = result.replace(/[^\S\n]+/g, ' ')

  // Collapse multiple newlines into double newlines
  result = result.replace(/\n{3,}/g, '\n\n')

  // Trim
  result = result.trim()

  return result
}

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T>(obj: T, preserveNewlines = false): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return (preserveNewlines ? sanitizeMultilineString(obj) : sanitizeString(obj)) as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, preserveNewlines)) as T
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip sanitization for certain field types
      if (key === 'password' || key === 'passwordHash' || key === 'token') {
        result[key] = value
        continue
      }

      // Preserve newlines in content/notes fields
      const shouldPreserveNewlines =
        preserveNewlines ||
        key === 'notes' ||
        key === 'content' ||
        key === 'description' ||
        key === 'triggerNotes' ||
        key === 'dischargeReason'

      result[key] = sanitizeObject(value, shouldPreserveNewlines)
    }
    return result as T
  }

  return obj
}

/**
 * Fields that should never be sanitized (passwords, tokens, etc.)
 */
const SKIP_SANITIZATION_FIELDS = new Set([
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'apiKey',
  'secret',
])

/**
 * Check if a field should skip sanitization
 */
export function shouldSkipSanitization(fieldName: string): boolean {
  return SKIP_SANITIZATION_FIELDS.has(fieldName)
}

/**
 * Validate and sanitize email format
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null
  }

  // Strip angle brackets first (common in email headers like "Name <user@example.com>")
  const trimmed = email.trim().toLowerCase().replace(/[<>]/g, '')

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    return null
  }

  return trimmed
}

/**
 * Sanitize phone number (keep only digits and common separators)
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') {
    return ''
  }

  // Keep only digits, spaces, dashes, parentheses, and plus sign
  return phone.replace(/[^\d\s\-()+ ]/g, '').trim()
}

/**
 * Validate that a string contains no control characters
 * (except common whitespace)
 */
export function hasNoControlChars(str: string): boolean {
  // Allow tabs, newlines, carriage returns, but reject other control chars
  // eslint-disable-next-line no-control-regex
  return !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(str)
}
