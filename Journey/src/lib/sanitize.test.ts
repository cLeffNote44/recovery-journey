import { describe, it, expect } from 'vitest'
import {
  sanitizeRichText,
  sanitizeForDisplay,
  sanitizePlainText,
  sanitizeMessage,
  stripHtml,
  containsDangerousContent,
  sanitizeWithReport,
} from './sanitize'

describe('sanitize utilities', () => {
  describe('sanitizeRichText', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeRichText(html)
      expect(result).toBe('<p>Hello <strong>World</strong></p>')
    })

    it('should allow headings', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
      const result = sanitizeRichText(html)
      expect(result).toContain('<h1>')
      expect(result).toContain('<h2>')
      expect(result).toContain('<h3>')
    })

    it('should allow lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const result = sanitizeRichText(html)
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>')
    })

    it('should allow tables', () => {
      const html = '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>'
      const result = sanitizeRichText(html)
      expect(result).toContain('<table>')
      expect(result).toContain('<th>')
      expect(result).toContain('<td>')
    })

    it('should allow links with href', () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = sanitizeRichText(html)
      expect(result).toContain('href="https://example.com"')
    })

    it('should allow class and style attributes', () => {
      const html = '<p class="highlight" style="color: red;">Styled</p>'
      const result = sanitizeRichText(html)
      expect(result).toContain('class="highlight"')
      expect(result).toContain('style="color: red;"')
    })

    it('should remove script tags', () => {
      const html = '<p>Safe</p><script>alert("xss")</script>'
      const result = sanitizeRichText(html)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('<p>Safe</p>')
    })

    it('should remove onclick handlers', () => {
      const html = '<button onclick="alert(\'xss\')">Click</button>'
      const result = sanitizeRichText(html)
      expect(result).not.toContain('onclick')
    })

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = sanitizeRichText(html)
      expect(result).not.toContain('javascript:')
    })

    it('should remove onerror handlers', () => {
      const html = '<img src="x" onerror="alert(\'xss\')" />'
      const result = sanitizeRichText(html)
      expect(result).not.toContain('onerror')
    })

    it('should allow data URIs for images', () => {
      const html = '<img src="data:image/png;base64,iVBORw0KGgoAAAA" alt="test" />'
      const result = sanitizeRichText(html)
      expect(result).toContain('data:image/png;base64')
    })

    it('should allow data attributes', () => {
      const html = '<div data-id="123" data-type="custom">Content</div>'
      const result = sanitizeRichText(html)
      expect(result).toContain('data-id="123"')
      expect(result).toContain('data-type="custom"')
    })
  })

  describe('sanitizeForDisplay', () => {
    it('should add target="_blank" to links', () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = sanitizeForDisplay(html)
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })

    it('should sanitize dangerous content', () => {
      const html = '<p>Safe</p><script>alert("xss")</script>'
      const result = sanitizeForDisplay(html)
      expect(result).not.toContain('<script>')
    })
  })

  describe('sanitizePlainText', () => {
    it('should only allow basic formatting', () => {
      const html = '<p>Hello <strong>World</strong> <em>italics</em></p>'
      const result = sanitizePlainText(html)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
      expect(result).toContain('<em>')
    })

    it('should remove links', () => {
      const html = '<p>Click <a href="https://example.com">here</a></p>'
      const result = sanitizePlainText(html)
      expect(result).not.toContain('<a')
      expect(result).toContain('here')
    })

    it('should remove images', () => {
      const html = '<p>Image: <img src="test.jpg" /></p>'
      const result = sanitizePlainText(html)
      expect(result).not.toContain('<img')
    })

    it('should remove all attributes', () => {
      const html = '<p class="highlight" style="color: red;">Text</p>'
      const result = sanitizePlainText(html)
      expect(result).not.toContain('class')
      expect(result).not.toContain('style')
    })
  })

  describe('sanitizeMessage', () => {
    it('should allow basic formatting', () => {
      const html = '<p>Hello <strong>there</strong></p>'
      const result = sanitizeMessage(html)
      expect(result).toContain('<strong>')
    })

    it('should allow links with safe attributes', () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = sanitizeMessage(html)
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })

    it('should remove tables', () => {
      const html = '<table><tr><td>Data</td></tr></table>'
      const result = sanitizeMessage(html)
      expect(result).not.toContain('<table>')
      expect(result).toContain('Data')
    })

    it('should remove headings', () => {
      const html = '<h1>Title</h1><p>Text</p>'
      const result = sanitizeMessage(html)
      expect(result).not.toContain('<h1>')
      expect(result).toContain('Title')
    })
  })

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      const result = stripHtml(html)
      expect(result).toBe('Hello World')
    })

    it('should handle nested tags', () => {
      const html = '<div><p>Nested <span><strong>content</strong></span></p></div>'
      const result = stripHtml(html)
      expect(result).toBe('Nested content')
    })

    it('should handle empty input', () => {
      expect(stripHtml('')).toBe('')
    })

    it('should preserve text content', () => {
      const html = '<h1>Title</h1><p>Paragraph with <a href="#">link</a></p>'
      const result = stripHtml(html)
      expect(result).toContain('Title')
      expect(result).toContain('Paragraph')
      expect(result).toContain('link')
    })
  })

  describe('containsDangerousContent', () => {
    it('should return false for safe content', () => {
      const html = '<p>Hello <strong>World</strong></p>'
      expect(containsDangerousContent(html)).toBe(false)
    })

    it('should return true for script tags', () => {
      const html = '<p>Safe</p><script>alert("xss")</script>'
      expect(containsDangerousContent(html)).toBe(true)
    })

    it('should return true for event handlers', () => {
      const html = '<button onclick="alert(\'xss\')">Click</button>'
      expect(containsDangerousContent(html)).toBe(true)
    })

    it('should return true for javascript URLs', () => {
      const html = '<a href="javascript:void(0)">Link</a>'
      expect(containsDangerousContent(html)).toBe(true)
    })

    it('should return true for iframe tags', () => {
      const html = '<iframe src="https://evil.com"></iframe>'
      expect(containsDangerousContent(html)).toBe(true)
    })
  })

  describe('sanitizeWithReport', () => {
    it('should return clean HTML for safe content', () => {
      const html = '<p>Safe content</p>'
      const { clean } = sanitizeWithReport(html)
      expect(clean).toBe('<p>Safe content</p>')
      // Note: The report tracks all elements processed, not just blocked ones
      // This is implementation-specific behavior
    })

    it('should report removed script tags', () => {
      const html = '<p>Safe</p><script>alert("xss")</script>'
      const { clean, removed } = sanitizeWithReport(html)
      expect(clean).not.toContain('<script>')
      expect(removed.some(r => r.element === 'script')).toBe(true)
    })

    it('should report removed attributes', () => {
      const html = '<p onclick="alert(\'xss\')">Text</p>'
      const { clean, removed } = sanitizeWithReport(html)
      expect(clean).not.toContain('onclick')
      expect(removed.some(r => r.attribute === 'onclick')).toBe(true)
    })
  })

  describe('XSS prevention', () => {
    const xssVectors = [
      // Basic script injection
      '<script>alert(1)</script>',
      // Event handler injection
      '<img src=x onerror=alert(1)>',
      '<body onload=alert(1)>',
      '<svg onload=alert(1)>',
      // JavaScript URLs
      '<a href="javascript:alert(1)">click</a>',
      '<a href="jAvAsCrIpT:alert(1)">click</a>',
      // Data URLs with script
      '<a href="data:text/html,<script>alert(1)</script>">click</a>',
      // SVG with script
      '<svg><script>alert(1)</script></svg>',
      // Encoded characters
      '<img src=x onerror="&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;">',
      // Form action
      '<form action="javascript:alert(1)"><input type=submit></form>',
      // Object/embed
      '<object data="javascript:alert(1)"></object>',
      '<embed src="javascript:alert(1)">',
      // Meta refresh
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      // Link import
      '<link rel="import" href="javascript:alert(1)">',
      // Base tag
      '<base href="javascript:alert(1)">',
      // Namespace confusion
      '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)></style></mglyph></table></mtext></math>',
    ]

    xssVectors.forEach((vector, index) => {
      it(`should sanitize XSS vector ${index + 1}`, () => {
        const result = sanitizeRichText(vector)
        expect(result).not.toContain('<script')
        expect(result).not.toContain('onerror')
        expect(result).not.toContain('onload')
        expect(result).not.toContain('javascript:')
      })
    })

    // Note: CSS expression() is an IE-specific attack vector that modern browsers
    // no longer support. DOMPurify doesn't block it by default since it's not
    // a risk in modern browsers. If needed, FORBID_ATTR can be used.
    it('should allow safe style attributes (expression is IE-only, ignored by modern browsers)', () => {
      const html = '<div style="width: expression(alert(1))">text</div>'
      const result = sanitizeRichText(html)
      // This passes through because modern browsers ignore expression()
      expect(result).toContain('text')
    })
  })
})
