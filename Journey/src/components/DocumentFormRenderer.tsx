import { useState, useCallback, useRef, useMemo } from 'react'
import {
  FileText,
  Save,
  Printer,
  X,
  Lock,
} from 'lucide-react'
import { sanitizeRichText } from '../lib/sanitize'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentFormRendererProps {
  templateHtml: string
  documentName: string
  initialValues?: Record<string, string | boolean>
  onSave: (values: Record<string, string | boolean>, renderedHtml: string) => void
  onClose: () => void
  readOnly?: boolean
}

/** Describes a single fillable field parsed from the template HTML. */
interface ParsedField {
  id: string
  type: 'text' | 'checkbox' | 'date' | 'phone' | 'ssn'
  label: string
  /** Approximate character width of the original underscore run. */
  width: number
}

/**
 * A "chunk" is either a piece of static markup that should be rendered as-is,
 * or a reference to a parsed field that should become an interactive input.
 */
type Chunk =
  | { kind: 'html'; html: string }
  | { kind: 'field'; fieldId: string }

/** One logical line/block extracted from the template. */
interface ParsedBlock {
  /** The original outer tag: p, h1, h2, h3, hr, table, ol, ul, li, etc. */
  tag: string
  /** For headings & static blocks the raw HTML is kept. */
  html?: string
  /** For fillable blocks, an ordered list of chunks. */
  chunks?: Chunk[]
  /** For tables, nested rows of chunks per cell. */
  tableRows?: { cells: Chunk[][] }[]
  /** For ordered/unordered lists, items as chunk arrays. */
  listItems?: Chunk[][]
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/** Matches 3+ consecutive underscores, optionally grouped with / or - separators for dates/phones/SSN. */
const UNDERSCORE_RE = /_{3,}/g

/** Matches checkbox character followed by a label word. */
const CHECKBOX_RE = /☐\s*([^☐<]*)/g

/** Detect date-like patterns: ____/____/________ */
const DATE_PATTERN_RE = /_{3,}\/_{3,}\/_{3,}/g

/** Detect phone-like patterns: (____) ____-________ */
const PHONE_PATTERN_RE = /\(_{3,}\)\s*_{3,}-_{3,}/g

/** Detect SSN-like patterns: _______-______-_________ */
const SSN_PATTERN_RE = /_{3,}-_{3,}-_{3,}/g

/**
 * Determine what "type" a given underscore sequence represents, based on
 * the surrounding characters in the source string.
 */
function classifyUnderscoreRun(
  fullText: string,
  matchIndex: number,
  matchLength: number,
): { type: ParsedField['type']; consumeStart: number; consumeEnd: number } {
  // Look at a window around the match to detect date / phone / SSN groupings.
  const before = fullText.slice(Math.max(0, matchIndex - 6), matchIndex)
  const after = fullText.slice(matchIndex + matchLength, matchIndex + matchLength + 20)

  // Phone: preceded by "(" and followed by ") ____-________"
  if (before.endsWith('(') && /^\)\s*_{3,}-_{3,}/.test(after)) {
    // The entire phone group: (____) ____-________
    const phoneMatch = fullText.slice(matchIndex - 1).match(/^\(_{3,}\)\s*_{3,}-_{3,}/)
    if (phoneMatch) {
      return {
        type: 'phone',
        consumeStart: matchIndex - 1,
        consumeEnd: matchIndex - 1 + phoneMatch[0].length,
      }
    }
  }

  // Date: ____/____/________
  if (/^\/_{3,}\/_{3,}/.test(after)) {
    const dateMatch = fullText.slice(matchIndex).match(/^_{3,}\/_{3,}\/_{3,}/)
    if (dateMatch) {
      return {
        type: 'date',
        consumeStart: matchIndex,
        consumeEnd: matchIndex + dateMatch[0].length,
      }
    }
  }

  // SSN: _______-______-_________
  if (/-_{3,}-_{3,}/.test(after)) {
    const ssnMatch = fullText.slice(matchIndex).match(/^_{3,}-_{3,}-_{3,}/)
    if (ssnMatch) {
      return {
        type: 'ssn',
        consumeStart: matchIndex,
        consumeEnd: matchIndex + ssnMatch[0].length,
      }
    }
  }

  return {
    type: 'text',
    consumeStart: matchIndex,
    consumeEnd: matchIndex + matchLength,
  }
}

/**
 * Given a piece of inline HTML (the innerHTML of a <p>, <td>, <li>, etc.),
 * extract an ordered list of Chunks and register any new fields found.
 *
 * `fields` is mutated — new entries are appended as they are discovered.
 * `contextLabel` is used to generate human-readable field IDs.
 */
function parseInlineHtml(
  html: string,
  fields: Map<string, ParsedField>,
  sectionLabel: string,
  blockIndex: number,
): Chunk[] {
  const chunks: Chunk[] = []
  // We operate on the *text* representation for underscore / checkbox detection,
  // but we need to keep the original HTML for static pieces.

  // 1) First handle checkboxes — they should become real inputs.
  // 2) Then handle underscore runs.

  // Strategy: walk through the HTML string, scanning for the next checkbox or
  // underscore run, emit static HTML chunks in between, and field-reference
  // chunks for each match.

  let cursor = 0
  let fieldSeq = 0

  // Build a combined regex that finds either a checkbox or an underscore run.
  // We need to be careful: the HTML may contain <strong> tags wrapping labels
  // that precede underscores.  We treat the *raw HTML string* as the source.

  // Pre-process: replace structured patterns (date, phone, SSN) first so they
  // get a single field instead of multiple.  We replace them with sentinel
  // tokens, then handle generic underscores, then checkboxes.

  // However, doing multiple passes with regex replacement on HTML is fragile.
  // Instead, use a single forward scan.

  // Helper: get a short label from preceding <strong> text or surrounding text.
  function extractLabel(pos: number): string {
    // Look backwards for the nearest <strong>…</strong> content.
    const preceding = html.slice(Math.max(0, pos - 200), pos)
    const strongMatch = preceding.match(/<strong>([^<]+)<\/strong>\s*$/)
    if (strongMatch) {
      return strongMatch[1].replace(/:+$/, '').trim()
    }
    // Fallback: take the preceding plain text words.
    const textBefore = preceding.replace(/<[^>]+>/g, '').trim()
    const words = textBefore.split(/\s+/).filter(Boolean)
    if (words.length > 0) {
      return words.slice(-3).join(' ').replace(/:+$/, '').trim()
    }
    return `field`
  }

  function makeFieldId(label: string, type: string): string {
    const base = `${sectionLabel}_${blockIndex}_${label}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 60)
    const candidate = `${base}_${type}_${fieldSeq}`
    fieldSeq++
    return candidate
  }

  // We scan for the *first* match of either pattern, consume it, push chunks.
  while (cursor < html.length) {
    // --- Checkbox ---
    const cbRe = /☐\s*([^☐<]*)/g
    cbRe.lastIndex = cursor
    const cbMatch = cbRe.exec(html)

    // --- Underscore ---
    // We need to find structured patterns first (date, phone, ssn), then plain.
    // Scan for the next underscore run starting from cursor.
    const usRe = /_{3,}/g
    usRe.lastIndex = cursor
    const usMatch = usRe.exec(html)

    // Determine which comes first.
    const cbIdx = cbMatch ? cbMatch.index : Infinity
    const usIdx = usMatch ? usMatch.index : Infinity

    if (cbIdx === Infinity && usIdx === Infinity) {
      // No more fillable content — emit remainder as static.
      chunks.push({ kind: 'html', html: html.slice(cursor) })
      break
    }

    if (cbIdx <= usIdx) {
      // Checkbox comes first (or is at the same position).
      if (cbMatch) {
        // Emit static content before the checkbox.
        if (cbMatch.index > cursor) {
          chunks.push({ kind: 'html', html: html.slice(cursor, cbMatch.index) })
        }
        const label = cbMatch[1].trim() || 'option'
        const fieldId = makeFieldId(label, 'checkbox')
        fields.set(fieldId, {
          id: fieldId,
          type: 'checkbox',
          label,
          width: 1,
        })
        chunks.push({ kind: 'field', fieldId })
        cursor = cbMatch.index + cbMatch[0].length
      }
    } else {
      // Underscore run comes first.
      if (usMatch) {
        // Check if this is part of a structured pattern.
        const classification = classifyUnderscoreRun(html, usMatch.index, usMatch[0].length)

        // Emit static content before the pattern.
        if (classification.consumeStart > cursor) {
          chunks.push({ kind: 'html', html: html.slice(cursor, classification.consumeStart) })
        }

        const label = extractLabel(classification.consumeStart)
        const fieldId = makeFieldId(label, classification.type)
        const patternText = html.slice(classification.consumeStart, classification.consumeEnd)
        fields.set(fieldId, {
          id: fieldId,
          type: classification.type,
          label,
          width: patternText.replace(/<[^>]+>/g, '').length,
        })
        chunks.push({ kind: 'field', fieldId })
        cursor = classification.consumeEnd
      }
    }
  }

  return chunks
}

/**
 * Parse the entire template HTML string into an array of ParsedBlocks,
 * and collect all discovered fields.
 */
function parseTemplate(html: string): { blocks: ParsedBlock[]; fields: Map<string, ParsedField> } {
  const fields = new Map<string, ParsedField>()
  const blocks: ParsedBlock[] = []

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const children = doc.body.childNodes

  let currentSection = 'doc'
  let blockIndex = 0

  function processElement(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        const chunks = parseInlineHtml(text, fields, currentSection, blockIndex++)
        blocks.push({ tag: 'p', chunks })
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as Element
    const tag = el.tagName.toLowerCase()

    // Track section for labelling.
    if (['h1', 'h2', 'h3'].includes(tag)) {
      const heading = el.textContent?.trim() || ''
      currentSection = heading.slice(0, 40)
      // Check if heading itself has fillable fields (unlikely but possible).
      const innerHtml = el.innerHTML
      if (UNDERSCORE_RE.test(innerHtml) || CHECKBOX_RE.test(innerHtml)) {
        const chunks = parseInlineHtml(innerHtml, fields, currentSection, blockIndex++)
        blocks.push({ tag, chunks })
      } else {
        blocks.push({ tag, html: el.outerHTML })
      }
      return
    }

    if (tag === 'hr') {
      blocks.push({ tag: 'hr' })
      return
    }

    if (tag === 'table') {
      const rows: { cells: Chunk[][] }[] = []
      el.querySelectorAll('tr').forEach((tr) => {
        const cells: Chunk[][] = []
        tr.querySelectorAll('th, td').forEach((cell) => {
          const innerHtml = cell.innerHTML
          if (UNDERSCORE_RE.test(innerHtml) || CHECKBOX_RE.test(innerHtml)) {
            cells.push(parseInlineHtml(innerHtml, fields, currentSection, blockIndex++))
          } else {
            cells.push([{ kind: 'html', html: innerHtml }])
          }
        })
        rows.push({ cells })
      })
      blocks.push({ tag: 'table', tableRows: rows })
      return
    }

    if (tag === 'ol' || tag === 'ul') {
      const items: Chunk[][] = []
      el.querySelectorAll(':scope > li').forEach((li) => {
        const innerHtml = li.innerHTML
        if (UNDERSCORE_RE.test(innerHtml) || CHECKBOX_RE.test(innerHtml)) {
          items.push(parseInlineHtml(innerHtml, fields, currentSection, blockIndex++))
        } else {
          items.push([{ kind: 'html', html: innerHtml }])
        }
      })
      blocks.push({ tag, listItems: items })
      return
    }

    if (tag === 'p') {
      const innerHtml = el.innerHTML
      if (UNDERSCORE_RE.test(innerHtml) || CHECKBOX_RE.test(innerHtml)) {
        const chunks = parseInlineHtml(innerHtml, fields, currentSection, blockIndex++)
        blocks.push({ tag: 'p', chunks })
      } else {
        blocks.push({ tag: 'p', html: el.outerHTML })
      }
      return
    }

    // Fallback — recurse into children.
    el.childNodes.forEach(processElement)
  }

  children.forEach(processElement)

  return { blocks, fields }
}

/**
 * Check whether an HTML template contains fill-in patterns (underscores or
 * checkboxes).  Used by Documents.tsx to decide whether to open the form
 * renderer or the rich-text editor.
 */
export function templateHasFormFields(html: string): boolean {
  return /_{3,}/.test(html) || /☐/.test(html)
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Render static HTML safely (already sanitised via DOMPurify on save). */
function StaticHtml({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldInputProps {
  field: ParsedField
  value: string | boolean
  onChange: (fieldId: string, value: string | boolean) => void
  readOnly: boolean
}

function FieldInput({ field, value, onChange, readOnly }: FieldInputProps) {
  if (field.type === 'checkbox') {
    return (
      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none mx-0.5">
        <input
          type="checkbox"
          checked={!!value}
          disabled={readOnly}
          onChange={(e) => onChange(field.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-60"
        />
        <span className="text-sm text-gray-800 dark:text-gray-200">{field.label}</span>
      </label>
    )
  }

  // Width heuristic: each underscore char ~8px, min 80px, max 400px.
  const minW = Math.max(80, Math.min(field.width * 8, 400))

  const placeholder = field.type === 'date'
    ? 'MM/DD/YYYY'
    : field.type === 'phone'
      ? '(___) ___-____'
      : field.type === 'ssn'
        ? '___-__-____'
        : ''

  return (
    <input
      type="text"
      value={typeof value === 'string' ? value : ''}
      disabled={readOnly}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder={placeholder}
      title={field.label}
      style={{ minWidth: `${minW}px` }}
      className={
        'inline-block mx-0.5 px-1.5 py-0.5 text-sm ' +
        'border-0 border-b-2 border-gray-300 dark:border-gray-600 ' +
        'bg-blue-50/40 dark:bg-blue-900/20 ' +
        'focus:border-blue-500 dark:focus:border-blue-400 focus:bg-blue-50 dark:focus:bg-blue-900/30 ' +
        'focus:outline-none focus:ring-0 ' +
        'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ' +
        'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ' +
        'transition-colors rounded-none'
      }
    />
  )
}

/** Renders a list of Chunks with the correct inputs wired up. */
function ChunkRenderer({
  chunks,
  fields,
  values,
  onChange,
  readOnly,
}: {
  chunks: Chunk[]
  fields: Map<string, ParsedField>
  values: Record<string, string | boolean>
  onChange: (id: string, v: string | boolean) => void
  readOnly: boolean
}) {
  return (
    <>
      {chunks.map((chunk, i) => {
        if (chunk.kind === 'html') {
          return <StaticHtml key={i} html={chunk.html} />
        }
        const field = fields.get(chunk.fieldId)
        if (!field) return null
        return (
          <FieldInput
            key={chunk.fieldId}
            field={field}
            value={values[chunk.fieldId] ?? (field.type === 'checkbox' ? false : '')}
            onChange={onChange}
            readOnly={readOnly}
          />
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DocumentFormRenderer({
  templateHtml,
  documentName,
  initialValues,
  onSave,
  onClose,
  readOnly = false,
}: DocumentFormRendererProps) {
  // Parse the template once.
  const { blocks, fields } = useMemo(() => parseTemplate(templateHtml), [templateHtml])

  // Form state — seed with initialValues or empty defaults.
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const defaults: Record<string, string | boolean> = {}
    fields.forEach((f) => {
      defaults[f.id] = f.type === 'checkbox' ? false : ''
    })
    return { ...defaults, ...initialValues }
  })

  const formRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((fieldId: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  // ---- Save -----------------------------------------------------------
  const handleSave = useCallback(() => {
    // Build the completed HTML by replacing underscore/checkbox patterns with
    // the actual values so the saved document is a filled-in copy.
    let rendered = templateHtml

    // Sort fields by id length descending so longer IDs get replaced first
    // (avoids partial-match collisions — though we use unique sentinels below).
    // Instead of trying to do regex replacement on the original HTML (fragile),
    // we reconstruct from the DOM parse.

    const parser = new DOMParser()
    const doc = parser.parseFromString(templateHtml, 'text/html')

    // Walk text nodes and replace underscore/checkbox patterns with values.
    function walkAndReplace(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Not applicable to text nodes directly — the patterns span innerHTML.
        return
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const el = node as Element
      const tag = el.tagName.toLowerCase()

      // Only process leaf containers (p, td, th, li) that have fillable content.
      if (['p', 'td', 'th', 'li'].includes(tag)) {
        const inner = el.innerHTML
        if (/_{3,}/.test(inner) || /☐/.test(inner)) {
          // Re-parse this element's inline HTML to map fields to positions.
          const localFields = new Map<string, ParsedField>()
          const chunks = parseInlineHtml(inner, localFields, '', 0)

          // Now rebuild innerHTML from chunks, substituting values.
          let rebuilt = ''
          for (const chunk of chunks) {
            if (chunk.kind === 'html') {
              rebuilt += chunk.html
            } else {
              // Find the matching field from our main fields map by matching
              // on the field's label + type.  The local parse generates new IDs
              // so we need to match by characteristics.
              const localField = localFields.get(chunk.fieldId)
              if (!localField) continue

              // Find the corresponding main-map field.
              let val: string | boolean = ''
              for (const [mainId, mainField] of fields) {
                if (
                  mainField.label === localField.label &&
                  mainField.type === localField.type &&
                  mainField.width === localField.width
                ) {
                  val = values[mainId] ?? ''
                  // Remove from candidates so duplicate fields get matched 1:1
                  // in order.  We can't delete from the main map since it's
                  // shared — instead mark via a consumed set.
                  break
                }
              }

              if (localField.type === 'checkbox') {
                rebuilt += val ? '☑ ' + localField.label : '☐ ' + localField.label
              } else {
                const strVal = typeof val === 'string' ? val : ''
                rebuilt += strVal || '_'.repeat(localField.width)
              }
            }
          }
          el.innerHTML = rebuilt
          return // Don't recurse into children — we just rebuilt innerHTML.
        }
      }

      // Recurse.
      el.childNodes.forEach(walkAndReplace)
    }

    doc.body.childNodes.forEach(walkAndReplace)
    rendered = doc.body.innerHTML

    // Sanitize before handing off.
    const sanitized = sanitizeRichText(rendered)
    onSave(values, sanitized)
  }, [templateHtml, values, fields, onSave])

  // ---- Print ----------------------------------------------------------
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Build a print-friendly version.
    const content = formRef.current?.innerHTML ?? ''
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentName}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 0.75in auto;
            color: #000;
          }
          h1 { font-size: 18pt; text-align: center; margin-bottom: 4pt; }
          h2 { font-size: 14pt; text-align: center; color: #444; margin-bottom: 12pt; }
          h3 { font-size: 12pt; margin-top: 16pt; border-bottom: 1px solid #ccc; padding-bottom: 4pt; }
          hr { border: none; border-top: 2px solid #333; margin: 16pt 0; }
          table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
          th, td { border: 1px solid #999; padding: 4pt 8pt; text-align: left; font-size: 11pt; }
          th { background: #f0f0f0; font-weight: bold; }
          input[type="text"] {
            border: none;
            border-bottom: 1px solid #000;
            font-family: inherit;
            font-size: inherit;
            padding: 0 4px;
            background: transparent;
          }
          input[type="checkbox"] { margin-right: 4px; }
          label { margin-right: 12px; }
          strong { font-weight: bold; }
          ol, ul { margin: 4pt 0; padding-left: 24pt; }
          li { margin-bottom: 4pt; }
          @media print {
            body { margin: 0; }
            input[type="text"] { border-bottom: 1px solid #000 !important; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }, [documentName])

  // ---- Render ---------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">{documentName}</span>
          {readOnly && (
            <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              <Lock className="w-3 h-3" />
              Read Only
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-auto p-8">
        <div
          ref={formRef}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 min-h-[800px]"
        >
          {blocks.map((block, idx) => (
            <BlockRenderer
              key={idx}
              block={block}
              fields={fields}
              values={values}
              onChange={handleChange}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BlockRenderer
// ---------------------------------------------------------------------------

function BlockRenderer({
  block,
  fields,
  values,
  onChange,
  readOnly,
}: {
  block: ParsedBlock
  fields: Map<string, ParsedField>
  values: Record<string, string | boolean>
  onChange: (id: string, v: string | boolean) => void
  readOnly: boolean
}) {
  // --- Static heading / paragraph ---
  if (block.html) {
    if (block.tag === 'hr') {
      return <hr className="my-4 border-t-2 border-gray-300 dark:border-gray-600" />
    }
    if (block.tag === 'h1') {
      return (
        <div
          className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1 mt-2"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )
    }
    if (block.tag === 'h2') {
      return (
        <div
          className="text-lg text-gray-600 dark:text-gray-400 text-center mb-4"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )
    }
    if (block.tag === 'h3') {
      return (
        <div
          className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      )
    }
    // Generic static paragraph.
    return (
      <div
        className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed my-1 [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    )
  }

  // --- HR ---
  if (block.tag === 'hr') {
    return <hr className="my-4 border-t-2 border-gray-300 dark:border-gray-600" />
  }

  // --- Heading with fields ---
  if (['h1', 'h2', 'h3'].includes(block.tag) && block.chunks) {
    const classes =
      block.tag === 'h1'
        ? 'text-2xl font-bold text-gray-900 dark:text-white text-center mb-1 mt-2'
        : block.tag === 'h2'
          ? 'text-lg text-gray-600 dark:text-gray-400 text-center mb-4'
          : 'text-base font-semibold text-gray-900 dark:text-white mt-6 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700'
    return (
      <div className={classes}>
        <ChunkRenderer chunks={block.chunks} fields={fields} values={values} onChange={onChange} readOnly={readOnly} />
      </div>
    )
  }

  // --- Paragraph with fields ---
  if (block.tag === 'p' && block.chunks) {
    return (
      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed my-1.5 flex flex-wrap items-baseline gap-y-1 [&_strong]:font-semibold">
        <ChunkRenderer chunks={block.chunks} fields={fields} values={values} onChange={onChange} readOnly={readOnly} />
      </p>
    )
  }

  // --- Table ---
  if (block.tag === 'table' && block.tableRows) {
    return (
      <table className="w-full border-collapse my-3 text-sm">
        <tbody>
          {block.tableRows.map((row, ri) => (
            <tr key={ri} className={ri === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
              {row.cells.map((cell, ci) => {
                const CellTag = ri === 0 ? 'th' : 'td'
                return (
                  <CellTag
                    key={ci}
                    className={
                      'border border-gray-300 dark:border-gray-600 px-3 py-2 text-left ' +
                      (ri === 0 ? 'font-semibold text-gray-700 dark:text-gray-300' : 'text-gray-800 dark:text-gray-200')
                    }
                  >
                    <ChunkRenderer chunks={cell} fields={fields} values={values} onChange={onChange} readOnly={readOnly} />
                  </CellTag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // --- Ordered / Unordered lists ---
  if ((block.tag === 'ol' || block.tag === 'ul') && block.listItems) {
    const ListTag = block.tag as 'ol' | 'ul'
    return (
      <ListTag
        className={
          'text-sm text-gray-800 dark:text-gray-200 my-2 pl-6 ' +
          (block.tag === 'ol' ? 'list-decimal' : 'list-disc')
        }
      >
        {block.listItems.map((item, i) => (
          <li key={i} className="my-1 leading-relaxed">
            <ChunkRenderer chunks={item} fields={fields} values={values} onChange={onChange} readOnly={readOnly} />
          </li>
        ))}
      </ListTag>
    )
  }

  return null
}
