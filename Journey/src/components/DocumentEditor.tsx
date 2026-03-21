import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { sanitizeRichText } from '../lib/sanitize'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Table as TableIcon,
  Link as LinkIcon,
  Highlighter,
  Type,
  Minus,
  X,
  Save,
  Download,
  FileText,
} from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface DocumentEditorProps {
  initialContent?: string
  documentName: string
  onClose: () => void
  onSave?: (content: string) => void
}

export default function DocumentEditor({ initialContent = '', documentName, onClose, onSave }: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content: initialContent || `
      <h1>Document Title</h1>
      <p>Start editing your document here...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[600px] p-8',
      },
    },
  })

  if (!editor) {
    return null
  }

  const handleSave = () => {
    const html = editor.getHTML()
    // Sanitize HTML before saving to prevent XSS attacks
    const sanitizedHtml = sanitizeRichText(html)
    onSave?.(sanitizedHtml)
  }

  const exportToDocx = async () => {
    const html = editor.getHTML()

    // Parse HTML and convert to docx paragraphs
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const children: Paragraph[] = []

    const processNode = (node: Node): Paragraph[] => {
      const paragraphs: Paragraph[] = []

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          paragraphs.push(new Paragraph({
            children: [new TextRun(text)],
          }))
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()

        if (tagName === 'h1') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: element.textContent || '', bold: true, size: 48 })],
            heading: HeadingLevel.HEADING_1,
          }))
        } else if (tagName === 'h2') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: element.textContent || '', bold: true, size: 36 })],
            heading: HeadingLevel.HEADING_2,
          }))
        } else if (tagName === 'h3') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: element.textContent || '', bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_3,
          }))
        } else if (tagName === 'p') {
          const runs: TextRun[] = []
          const processInlineNodes = (n: Node) => {
            if (n.nodeType === Node.TEXT_NODE) {
              runs.push(new TextRun(n.textContent || ''))
            } else if (n.nodeType === Node.ELEMENT_NODE) {
              const el = n as Element
              const tag = el.tagName.toLowerCase()
              const text = el.textContent || ''

              if (tag === 'strong' || tag === 'b') {
                runs.push(new TextRun({ text, bold: true }))
              } else if (tag === 'em' || tag === 'i') {
                runs.push(new TextRun({ text, italics: true }))
              } else if (tag === 'u') {
                runs.push(new TextRun({ text, underline: {} }))
              } else if (tag === 's' || tag === 'strike') {
                runs.push(new TextRun({ text, strike: true }))
              } else {
                runs.push(new TextRun(text))
              }
            }
          }
          element.childNodes.forEach(processInlineNodes)

          let alignment: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT
          const style = element.getAttribute('style') || ''
          if (style.includes('text-align: center')) alignment = AlignmentType.CENTER
          if (style.includes('text-align: right')) alignment = AlignmentType.RIGHT
          if (style.includes('text-align: justify')) alignment = AlignmentType.JUSTIFIED

          paragraphs.push(new Paragraph({ children: runs, alignment }))
        } else if (tagName === 'ul' || tagName === 'ol') {
          element.querySelectorAll('li').forEach((li, index) => {
            paragraphs.push(new Paragraph({
              children: [new TextRun(`${tagName === 'ol' ? `${index + 1}. ` : '• '}${li.textContent || ''}`)],
            }))
          })
        } else if (tagName === 'hr') {
          paragraphs.push(new Paragraph({
            children: [new TextRun('─'.repeat(50))],
          }))
        } else {
          element.childNodes.forEach(child => {
            paragraphs.push(...processNode(child))
          })
        }
      }

      return paragraphs
    }

    doc.body.childNodes.forEach(node => {
      children.push(...processNode(node))
    })

    const docxDoc = new Document({
      sections: [{
        properties: {},
        children: children.length > 0 ? children : [new Paragraph({ children: [new TextRun('')] })],
      }],
    })

    const blob = await Packer.toBlob(docxDoc)
    saveAs(blob, `${documentName.replace(/\.[^/.]+$/, '')}.docx`)
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const setHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">{documentName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={exportToDocx}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export .docx
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-1 flex-wrap">
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Headings */}
        <select
          onChange={(e) => {
            const value = e.target.value
            if (value === 'p') {
              editor.chain().focus().setParagraph().run()
            } else {
              setHeading(parseInt(value) as 1 | 2 | 3)
            }
          }}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="p">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Text color */}
        <div className="relative">
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Table */}
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Link */}
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Horizontal Rule */}
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Clear Formatting */}
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Clear Formatting"
        >
          <Type className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg min-h-[800px]">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none [&_.ProseMirror]:min-h-[750px] [&_.ProseMirror]:p-8 [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:w-full [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-300 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-gray-100 dark:[&_.ProseMirror_th]:bg-gray-700"
          />
        </div>
      </div>
    </div>
  )
}
