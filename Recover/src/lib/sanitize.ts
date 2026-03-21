import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user-generated HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize plain text input (removes all HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize user input for display (allows line breaks)
 */
export function sanitizeForDisplay(input: string): string {
  // Replace newlines with <br> tags, then sanitize
  const withBreaks = input.replace(/\n/g, '<br>');
  return DOMPurify.sanitize(withBreaks, {
    ALLOWED_TAGS: ['br'],
    ALLOWED_ATTR: []
  });
}
