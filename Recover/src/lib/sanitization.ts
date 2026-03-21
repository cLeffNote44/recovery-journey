/**
 * Input Sanitization Utilities
 *
 * Prevents XSS and other injection attacks by sanitizing user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize text input to prevent XSS
 * Removes all HTML tags and dangerous content
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  // Remove all HTML tags
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return sanitized.trim();
}

/**
 * Sanitize rich text (allows some safe HTML)
 * For future use if rich text editor is added
 */
export function sanitizeRichText(input: string): string {
  if (!input) return '';

  // Allow only safe formatting tags
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return sanitized.trim();
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const sanitized = sanitizeText(email).toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters except + for international
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Enforce maximum length on input
 */
export function enforceMaxLength(input: string, maxLength: number): string {
  if (!input) return '';
  return input.slice(0, maxLength);
}

/**
 * Sanitize notes/journal entries
 */
export function sanitizeNotes(notes: string, maxLength: number = 5000): string {
  if (!notes) return '';

  const sanitized = sanitizeText(notes);
  return enforceMaxLength(sanitized, maxLength);
}

/**
 * Sanitize contact name
 */
export function sanitizeName(name: string, maxLength: number = 100): string {
  if (!name) return '';

  const sanitized = sanitizeText(name);
  return enforceMaxLength(sanitized, maxLength);
}

/**
 * Sanitize trigger/craving description
 */
export function sanitizeTrigger(trigger: string, maxLength: number = 200): string {
  if (!trigger) return '';

  const sanitized = sanitizeText(trigger);
  return enforceMaxLength(sanitized, maxLength);
}

/**
 * Validate and sanitize date string
 */
export function sanitizeDate(dateStr: string): string {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString();
  } catch {
    return '';
  }
}

/**
 * Validate and sanitize number
 */
export function sanitizeNumber(value: unknown, min?: number, max?: number): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  let sanitized = num;

  if (min !== undefined && sanitized < min) {
    sanitized = min;
  }

  if (max !== undefined && sanitized > max) {
    sanitized = max;
  }

  return sanitized;
}

/**
 * Batch sanitize object fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldSanitizers: Partial<Record<keyof T, (value: any) => any>>
): T {
  const sanitized = { ...obj };

  for (const [key, sanitizer] of Object.entries(fieldSanitizers)) {
    if (key in sanitized) {
      sanitized[key as keyof T] = sanitizer(sanitized[key as keyof T]);
    }
  }

  return sanitized;
}
