import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify'

/**
 * HTML Sanitization Utility
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 * This is critical for healthcare applications where:
 * 1. Rich text content may be stored and displayed
 * 2. Patient-generated content needs to be safely rendered
 * 3. Compliance requires protection of all stored data
 *
 * IMPORTANT: Always sanitize HTML before:
 * - Storing in database
 * - Rendering with dangerouslySetInnerHTML
 * - Displaying user-generated content
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default DOMPurify configuration for rich text editors
 * Allows common formatting but strips dangerous elements
 */
const RICH_TEXT_CONFIG: DOMPurifyConfig = {
  // Allowed HTML tags
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'span', 'div',
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
    'sub', 'sup', 'mark',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
    // Links (href validated separately)
    'a',
    // Block elements
    'blockquote', 'pre', 'code', 'hr',
    // Media (with restrictions)
    'img',
  ],

  // Allowed attributes
  ALLOWED_ATTR: [
    // Global
    'class', 'id', 'style',
    // Links
    'href', 'target', 'rel', 'title',
    // Images
    'src', 'alt', 'width', 'height',
    // Tables
    'colspan', 'rowspan', 'scope',
    // Accessibility
    'role', 'aria-label', 'aria-hidden', 'aria-describedby',
    // Data attributes (for editor state)
    'data-*',
  ],

  // Only allow safe URI schemes (regex adapted from DOMPurify — kept verbatim)
  // eslint-disable-next-line no-useless-escape
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

  // Allow data URIs for images (base64 encoded)
  ADD_DATA_URI_TAGS: ['img'],

  // Force all links to open in new tab with security attributes
  ADD_ATTR: ['target'],

  // Keep safe inline styles
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

/**
 * Strict configuration for plain text with minimal formatting
 */
const PLAIN_TEXT_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i'],
  ALLOWED_ATTR: [],
}

/**
 * Message/chat content configuration
 * More restrictive than rich text
 */
const MESSAGE_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'span',
    'strong', 'b', 'em', 'i',
    'a',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  // eslint-disable-next-line no-useless-escape
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
}

// =============================================================================
// SANITIZATION FUNCTIONS
// =============================================================================

/**
 * Sanitize HTML for rich text editor content
 *
 * @example
 * ```tsx
 * const safeHtml = sanitizeRichText(editorContent)
 * await saveDocument({ content: safeHtml })
 * ```
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG) as string
}

/**
 * Sanitize HTML for display with dangerouslySetInnerHTML
 * Adds additional hooks to ensure links are safe
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(content) }} />
 * ```
 */
export function sanitizeForDisplay(html: string): string {
  // Add hook to force safe link attributes
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  const result = DOMPurify.sanitize(html, RICH_TEXT_CONFIG) as string

  // Remove the hook after use
  DOMPurify.removeHook('afterSanitizeAttributes')

  return result
}

/**
 * Sanitize plain text content
 * Only allows basic text formatting
 *
 * @example
 * ```tsx
 * const safeText = sanitizePlainText(userInput)
 * ```
 */
export function sanitizePlainText(html: string): string {
  return DOMPurify.sanitize(html, PLAIN_TEXT_CONFIG) as string
}

/**
 * Sanitize message/chat content
 * More restrictive than rich text
 *
 * @example
 * ```tsx
 * const safeMessage = sanitizeMessage(messageContent)
 * await sendMessage({ content: safeMessage })
 * ```
 */
export function sanitizeMessage(html: string): string {
  // Force safe link attributes for messages
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  const result = DOMPurify.sanitize(html, MESSAGE_CONFIG) as string

  DOMPurify.removeHook('afterSanitizeAttributes')

  return result
}

/**
 * Strip all HTML tags, returning only text content
 *
 * @example
 * ```tsx
 * const plainText = stripHtml('<p>Hello <strong>World</strong></p>')
 * // Returns: "Hello World"
 * ```
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }) as string
}

/**
 * Sanitize with custom configuration
 *
 * @example
 * ```tsx
 * const customHtml = sanitizeCustom(content, {
 *   ALLOWED_TAGS: ['p', 'a'],
 *   ALLOWED_ATTR: ['href'],
 * })
 * ```
 */
export function sanitizeCustom(html: string, config: DOMPurifyConfig): string {
  return DOMPurify.sanitize(html, config) as string
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Check if HTML contains potentially dangerous content
 * Useful for validation before saving
 *
 * @example
 * ```tsx
 * if (containsDangerousContent(userInput)) {
 *   showWarning('Content contains potentially unsafe elements')
 * }
 * ```
 */
export function containsDangerousContent(html: string): boolean {
  const sanitized = DOMPurify.sanitize(html, RICH_TEXT_CONFIG) as string
  // If sanitization changed the content, it contained dangerous elements
  return html !== sanitized
}

/**
 * Get a list of removed elements/attributes
 * Useful for logging/auditing
 *
 * @example
 * ```tsx
 * const { clean, removed } = sanitizeWithReport(userInput)
 * if (removed.length > 0) {
 *   auditLog.log({ action: 'CONTENT_SANITIZED', metadata: { removed } })
 * }
 * ```
 */
export function sanitizeWithReport(html: string): {
  clean: string
  removed: Array<{ element?: string; attribute?: string; value?: string }>
} {
  const removed: Array<{ element?: string; attribute?: string; value?: string }> = []

  DOMPurify.addHook('uponSanitizeElement', (_node, data) => {
    if (data.tagName && !RICH_TEXT_CONFIG.ALLOWED_TAGS?.includes(data.tagName)) {
      removed.push({ element: data.tagName })
    }
  })

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName && data.attrValue) {
      const allowedAttrs = RICH_TEXT_CONFIG.ALLOWED_ATTR || []
      if (!allowedAttrs.some((attr: string) =>
        attr === data.attrName || (attr === 'data-*' && data.attrName.startsWith('data-'))
      )) {
        removed.push({
          attribute: data.attrName,
          value: data.attrValue.substring(0, 100), // Truncate for logging
        })
      }
    }
  })

  const clean = DOMPurify.sanitize(html, RICH_TEXT_CONFIG) as string

  DOMPurify.removeHook('uponSanitizeElement')
  DOMPurify.removeHook('uponSanitizeAttribute')

  return { clean, removed }
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useCallback } from 'react'

/**
 * React hook for HTML sanitization
 *
 * @example
 * ```tsx
 * function DocumentViewer({ content }) {
 *   const { sanitize, isSafe } = useSanitize()
 *   const safeContent = useMemo(() => sanitize(content), [content, sanitize])
 *
 *   return <div dangerouslySetInnerHTML={{ __html: safeContent }} />
 * }
 * ```
 */
export function useSanitize() {
  const sanitize = useCallback((html: string) => {
    return sanitizeForDisplay(html)
  }, [])

  const sanitizeText = useCallback((html: string) => {
    return sanitizePlainText(html)
  }, [])

  const sanitizeMsg = useCallback((html: string) => {
    return sanitizeMessage(html)
  }, [])

  const strip = useCallback((html: string) => {
    return stripHtml(html)
  }, [])

  const isSafe = useCallback((html: string) => {
    return !containsDangerousContent(html)
  }, [])

  return {
    sanitize,
    sanitizeText,
    sanitizeMsg,
    strip,
    isSafe,
  }
}

// =============================================================================
// CONSTANTS FOR EXTERNAL USE
// =============================================================================

export const SanitizeConfig = {
  RICH_TEXT: RICH_TEXT_CONFIG,
  PLAIN_TEXT: PLAIN_TEXT_CONFIG,
  MESSAGE: MESSAGE_CONFIG,
}
