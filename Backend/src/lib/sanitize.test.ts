/**
 * Tests for input sanitization library
 */

import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeMultilineString,
  sanitizeObject,
  sanitizeEmail,
  sanitizePhone,
  hasNoControlChars,
} from './sanitize.js'

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    )
  })

  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('preserves safe content', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})

describe('stripHtml', () => {
  it('removes script tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Hello')).toBe('Hello')
  })

  it('removes style tags', () => {
    expect(stripHtml('<style>body{display:none}</style>Hello')).toBe('Hello')
  })

  it('removes all HTML tags', () => {
    expect(stripHtml('<div><p>Hello</p></div>')).toBe('Hello')
  })

  it('removes event handlers', () => {
    expect(stripHtml('Hello onclick=alert(1)')).toBe('Hello alert(1)')
  })

  it('removes javascript: URLs', () => {
    expect(stripHtml('javascript:alert(1)')).toBe('alert(1)')
  })
})

describe('sanitizeString', () => {
  it('removes HTML and normalizes whitespace', () => {
    expect(sanitizeString('<b>Hello</b>   World')).toBe('Hello World')
  })

  it('handles non-string input', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
    expect(sanitizeString(123)).toBe('')
  })

  it('trims whitespace', () => {
    expect(sanitizeString('  Hello  ')).toBe('Hello')
  })
})

describe('sanitizeMultilineString', () => {
  it('preserves single newlines', () => {
    expect(sanitizeMultilineString('Hello\nWorld')).toBe('Hello\nWorld')
  })

  it('collapses multiple newlines', () => {
    expect(sanitizeMultilineString('Hello\n\n\n\nWorld')).toBe('Hello\n\nWorld')
  })

  it('removes HTML but preserves line structure', () => {
    expect(sanitizeMultilineString('<p>Hello</p>\n<p>World</p>')).toBe('Hello\nWorld')
  })
})

describe('sanitizeObject', () => {
  it('sanitizes all string values', () => {
    const input = {
      name: '<script>alert(1)</script>John',
      age: 25,
      nested: {
        value: '<b>test</b>',
      },
    }

    const result = sanitizeObject(input)

    expect(result.name).toBe('John')
    expect(result.age).toBe(25)
    expect(result.nested.value).toBe('test')
  })

  it('skips password fields', () => {
    const input = {
      email: '<script>test</script>user@example.com',
      password: 'my<>password',
    }

    const result = sanitizeObject(input)

    expect(result.email).toBe('user@example.com')
    expect(result.password).toBe('my<>password')
  })

  it('preserves newlines in notes fields', () => {
    const input = {
      title: 'Test',
      notes: 'Line 1\nLine 2\nLine 3',
    }

    const result = sanitizeObject(input)

    expect(result.notes).toBe('Line 1\nLine 2\nLine 3')
  })

  it('handles arrays', () => {
    const input = ['<b>one</b>', '<i>two</i>']
    const result = sanitizeObject(input)

    expect(result).toEqual(['one', 'two'])
  })

  it('handles null and undefined', () => {
    expect(sanitizeObject(null)).toBe(null)
    expect(sanitizeObject(undefined)).toBe(undefined)
  })
})

describe('sanitizeEmail', () => {
  it('accepts valid emails', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
    expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com')
  })

  it('rejects invalid emails', () => {
    expect(sanitizeEmail('not-an-email')).toBe(null)
    expect(sanitizeEmail('user@')).toBe(null)
    expect(sanitizeEmail('@example.com')).toBe(null)
  })

  it('removes angle brackets', () => {
    expect(sanitizeEmail('<user@example.com>')).toBe('user@example.com')
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
  })

  it('handles non-string input', () => {
    expect(sanitizeEmail(null)).toBe(null)
    expect(sanitizeEmail(123)).toBe(null)
  })
})

describe('sanitizePhone', () => {
  it('keeps valid phone characters', () => {
    expect(sanitizePhone('(555) 123-4567')).toBe('(555) 123-4567')
    expect(sanitizePhone('+1 555-123-4567')).toBe('+1 555-123-4567')
  })

  it('removes invalid characters', () => {
    expect(sanitizePhone('555-123-4567<script>')).toBe('555-123-4567')
  })

  it('handles non-string input', () => {
    expect(sanitizePhone(null)).toBe('')
    expect(sanitizePhone(123)).toBe('')
  })
})

describe('hasNoControlChars', () => {
  it('allows normal text', () => {
    expect(hasNoControlChars('Hello World')).toBe(true)
  })

  it('allows tabs and newlines', () => {
    expect(hasNoControlChars('Hello\tWorld\n')).toBe(true)
  })

  it('rejects null bytes', () => {
    expect(hasNoControlChars('Hello\x00World')).toBe(false)
  })

  it('rejects other control characters', () => {
    expect(hasNoControlChars('Hello\x1FWorld')).toBe(false)
  })
})
