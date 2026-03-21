import { useState, useRef } from 'react'
import {
  FileText,
  Upload,
  Search,
  Folder,
  File,
  Download,
  Trash2,
  Eye,
  Plus,
  Grid,
  List,
  Image,
  FileSpreadsheet,
  FilePlus,
  Edit,
  Copy,
} from 'lucide-react'
import DocumentEditor from '../components/DocumentEditor'
import DocumentFormRenderer, { templateHasFormFields } from '../components/DocumentFormRenderer'
import { documentTemplates, templateList, type DocumentTemplate } from '../data/documentTemplates'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { UploadModal, PreviewModal, CreateDocumentModal, type Document } from '../components/Documents'
import { ConfirmModal } from '../components/ui/Modal'

// ============================================================================
// TYPES
// ============================================================================

interface PatientDocument extends Document {
  createdBy: string
  formValues?: Record<string, string>
  templateId?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPatients = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Michael Brown' },
  { id: '4', name: 'Sarah Davis' },
  { id: '5', name: 'David Wilson' },
]

// Seed patient documents with a few examples for demo purposes
const initialPatientDocuments: PatientDocument[] = [
  {
    id: 'pd-1',
    name: 'Patient Intake Form - John Doe',
    type: 'document',
    category: 'intake',
    size: '245 KB',
    uploadedBy: 'Dr. Martinez',
    uploadedAt: '2025-11-20',
    patientId: '1',
    patientName: 'John Doe',
    content: documentTemplates.patientIntake,
    createdBy: 'Dr. Martinez',
    templateId: 'tpl-intake',
  },
  {
    id: 'pd-2',
    name: 'Consent for Treatment - Jane Smith',
    type: 'document',
    category: 'consent',
    size: '124 KB',
    uploadedBy: 'Lisa Anderson',
    uploadedAt: '2025-11-18',
    patientId: '2',
    patientName: 'Jane Smith',
    content: documentTemplates.consentTreatment,
    createdBy: 'Lisa Anderson',
    templateId: 'tpl-consent',
  },
  {
    id: 'pd-3',
    name: 'Discharge Summary - David Wilson',
    type: 'document',
    category: 'discharge',
    size: '198 KB',
    uploadedBy: 'Dr. Thompson',
    uploadedAt: '2025-11-14',
    patientId: '5',
    patientName: 'David Wilson',
    content: documentTemplates.dischargeSummary,
    createdBy: 'Dr. Thompson',
    templateId: 'tpl-discharge',
  },
]

// Non-editable files (PDFs, images, etc.)
const nonEditableFiles: PatientDocument[] = [
  { id: '200', name: 'Insurance Card - Jane Smith.jpg', type: 'image', category: 'insurance', size: '856 KB', uploadedBy: 'Lisa Anderson', uploadedAt: '2025-11-18', patientId: '2', patientName: 'Jane Smith', createdBy: 'Lisa Anderson' },
  { id: '201', name: 'Lab Results - Sarah Davis.pdf', type: 'pdf', category: 'medical', size: '2.1 MB', uploadedBy: 'Nurse White', uploadedAt: '2025-11-15', patientId: '4', patientName: 'Sarah Davis', createdBy: 'Nurse White' },
  { id: '202', name: 'Insurance Verification - John Doe.pdf', type: 'pdf', category: 'insurance', size: '445 KB', uploadedBy: 'Billing Dept', uploadedAt: '2025-11-12', patientId: '1', patientName: 'John Doe', createdBy: 'Billing Dept' },
  { id: '203', name: 'Court Order - Michael Brown.pdf', type: 'pdf', category: 'consent', size: '1.2 MB', uploadedBy: 'Admin', uploadedAt: '2025-11-10', patientId: '3', patientName: 'Michael Brown', createdBy: 'Admin' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText className="w-8 h-8 text-red-500" />
    case 'image': return <Image className="w-8 h-8 text-blue-500" />
    case 'spreadsheet': return <FileSpreadsheet className="w-8 h-8 text-green-500" />
    case 'document': return <File className="w-8 h-8 text-blue-600" />
    default: return <File className="w-8 h-8 text-gray-500" />
  }
}

const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    intake: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    consent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    insurance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    discharge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[category] || colors.other}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Documents() {
  const [activeTab, setActiveTab] = useState<'templates' | 'documents'>('templates')
  const [patientDocuments, setPatientDocuments] = useState<PatientDocument[]>([
    ...initialPatientDocuments,
    ...nonEditableFiles,
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create document modal state
  const [createModalTemplate, setCreateModalTemplate] = useState<DocumentTemplate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Delete confirmation state
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadCategory, setUploadCategory] = useState('intake')
  const [uploadPatient, setUploadPatient] = useState('')

  // Sort state for patient documents
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ---- Templates tab data ----
  const filteredTemplates = templateList
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

  // ---- Patient Documents tab data ----
  const filteredPatientDocs = patientDocuments
    .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
    .filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        const cmp = a.uploadedAt.localeCompare(b.uploadedAt)
        return sortDir === 'desc' ? -cmp : cmp
      }
      const cmp = a.name.localeCompare(b.name)
      return sortDir === 'desc' ? -cmp : cmp
    })

  // ---- Category counts ----
  const getCategoryCounts = () => {
    if (activeTab === 'templates') {
      return {
        all: templateList.length,
        intake: templateList.filter(t => t.category === 'intake').length,
        medical: templateList.filter(t => t.category === 'medical').length,
        consent: templateList.filter(t => t.category === 'consent').length,
        insurance: 0,
        progress: templateList.filter(t => t.category === 'progress').length,
        discharge: templateList.filter(t => t.category === 'discharge').length,
        other: templateList.filter(t => t.category === 'other').length,
      }
    }
    return {
      all: patientDocuments.length,
      intake: patientDocuments.filter(d => d.category === 'intake').length,
      medical: patientDocuments.filter(d => d.category === 'medical').length,
      consent: patientDocuments.filter(d => d.category === 'consent').length,
      insurance: patientDocuments.filter(d => d.category === 'insurance').length,
      progress: patientDocuments.filter(d => d.category === 'progress').length,
      discharge: patientDocuments.filter(d => d.category === 'discharge').length,
      other: patientDocuments.filter(d => d.category === 'other').length,
    }
  }

  const counts = getCategoryCounts()

  const categories = [
    { id: 'all', name: 'All', icon: Folder, count: counts.all },
    { id: 'intake', name: 'Intake Forms', icon: FilePlus, count: counts.intake },
    { id: 'medical', name: 'Medical Records', icon: FileText, count: counts.medical },
    { id: 'consent', name: 'Consent Forms', icon: File, count: counts.consent },
    ...(activeTab === 'documents' ? [{ id: 'insurance', name: 'Insurance', icon: FileSpreadsheet, count: counts.insurance }] : []),
    { id: 'progress', name: 'Progress Notes', icon: FileText, count: counts.progress },
    { id: 'discharge', name: 'Discharge', icon: File, count: counts.discharge },
    ...(counts.other > 0 ? [{ id: 'other', name: 'Other', icon: File, count: counts.other }] : []),
  ]

  // ---- Event handlers ----

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFiles(Array.from(e.dataTransfer.files))
      setShowUploadModal(true)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFiles(Array.from(e.target.files))
      setShowUploadModal(true)
    }
  }

  const handleUpload = () => {
    const newDocs: PatientDocument[] = uploadFiles.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      name: file.name,
      type: (file.type.includes('pdf') ? 'pdf' :
            file.type.includes('image') ? 'image' :
            file.type.includes('sheet') ? 'spreadsheet' : 'document') as Document['type'],
      category: uploadCategory as Document['category'],
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString().split('T')[0],
      patientId: uploadPatient || undefined,
      patientName: uploadPatient ? mockPatients.find(p => p.id === uploadPatient)?.name : undefined,
      createdBy: 'Current User',
    }))
    setPatientDocuments([...newDocs, ...patientDocuments])
    setShowUploadModal(false)
    setUploadFiles([])
    setUploadCategory('intake')
    setUploadPatient('')
    // Switch to documents tab to show the upload
    setActiveTab('documents')
  }

  const handleDeleteDocument = (id: string) => {
    setDeleteDocId(id)
  }

  const confirmDelete = () => {
    if (deleteDocId) {
      setPatientDocuments(patientDocuments.filter(d => d.id !== deleteDocId))
      setDeleteDocId(null)
    }
  }

  const handleSaveDocument = (content: string) => {
    if (editingDoc) {
      setPatientDocuments(patientDocuments.map(d =>
        d.id === editingDoc.id ? { ...d, content } : d
      ))
      setEditingDoc(null)
    }
  }

  const handleUseTemplate = (template: DocumentTemplate) => {
    setCreateModalTemplate(template)
    setShowCreateModal(true)
  }

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    const previewDocument: Document = {
      id: template.id,
      name: template.name,
      type: 'document',
      category: template.category as Document['category'],
      size: '-',
      uploadedBy: 'System',
      uploadedAt: '-',
      content: documentTemplates[template.templateKey],
    }
    // Open in the form renderer in read-only/preview mode
    setEditingDoc(previewDocument)
  }

  const handleCreateDocument = (data: {
    title: string
    patientId: string
    patientName: string
    category: string
    templateKey: DocumentTemplate['templateKey']
  }) => {
    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      name: data.title,
      type: 'document',
      category: data.category as Document['category'],
      size: '0 KB',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString().split('T')[0],
      patientId: data.patientId,
      patientName: data.patientName,
      content: documentTemplates[data.templateKey],
      createdBy: 'Current User',
      templateId: createModalTemplate?.id,
    }
    setPatientDocuments([newDoc, ...patientDocuments])
    setShowCreateModal(false)
    setCreateModalTemplate(null)
    // Switch to documents tab and open the new doc for editing
    setActiveTab('documents')
    setEditingDoc(newDoc)
  }

  const handleTabChange = (tab: 'templates' | 'documents') => {
    setActiveTab(tab)
    setSelectedCategory('all')
    setSearchTerm('')
  }

  return (
    <SectionErrorBoundary>
    <div className="animate-fadeIn flex gap-6">
      {/* Sidebar Categories */}
      <nav className="w-64 flex-shrink-0" aria-label="Document categories">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4" id="categories-heading">Categories</h3>
          <ul className="space-y-1" role="listbox" aria-labelledby="categories-heading">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <li key={cat.id} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Quick Upload — only show on Documents tab */}
        {activeTab === 'documents' && (
          <div
            className={`mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop files here
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              or browse files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage templates and patient records</p>
          </div>
          {activeTab === 'documents' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange('templates')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => handleTabChange('documents')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Patient Documents
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <label htmlFor="document-search" className="sr-only">
              {activeTab === 'templates' ? 'Search templates...' : 'Search documents or patients...'}
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              id="document-search"
              type="text"
              placeholder={activeTab === 'templates' ? 'Search templates...' : 'Search documents or patients...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          {activeTab === 'documents' && (
            <>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [by, dir] = e.target.value.split('-') as ['date' | 'name', 'asc' | 'desc']
                  setSortBy(by)
                  setSortDir(dir)
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                aria-label="Sort documents"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* TEMPLATES TAB */}
        {/* ============================================================ */}
        {activeTab === 'templates' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {template.name}
                      </h3>
                      <div className="mt-1">
                        {getCategoryBadge(template.category)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                    {template.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No templates found</p>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* PATIENT DOCUMENTS TAB */}
        {/* ============================================================ */}
        {activeTab === 'documents' && (
          <>
            {viewMode === 'list' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Patient</th>
                      <th className="px-5 py-3 font-medium">Size</th>
                      <th className="px-5 py-3 font-medium">Created</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredPatientDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.type)}
                            <span className="font-medium text-gray-900 dark:text-white">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">{getCategoryBadge(doc.category)}</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                          {doc.patientName || '-'}
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{doc.size}</td>
                        <td className="px-5 py-4">
                          <div className="text-gray-600 dark:text-gray-400">
                            <div>{doc.uploadedAt}</div>
                            <div className="text-xs text-gray-500">by {doc.createdBy || doc.uploadedBy}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {doc.type === 'document' ? (
                              <button
                                onClick={() => setEditingDoc(doc)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                                title="Edit Document"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredPatientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-center mb-3">
                      {getFileIcon(doc.type)}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm text-center truncate mb-1">
                      {doc.name}
                    </p>
                    {doc.patientName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                        {doc.patientName}
                      </p>
                    )}
                    <div className="flex justify-center mb-3">
                      {getCategoryBadge(doc.category)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                      {doc.size} &middot; {doc.uploadedAt}
                    </div>
                    <div className="flex justify-center gap-2">
                      {doc.type === 'document' ? (
                        <button
                          onClick={() => setEditingDoc(doc)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredPatientDocs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No documents found</p>
                {patientDocuments.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Use a template to create your first patient document
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadFiles={uploadFiles}
        setUploadFiles={setUploadFiles}
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        uploadPatient={uploadPatient}
        setUploadPatient={setUploadPatient}
        onUpload={handleUpload}
        dragActive={dragActive}
        onDrag={handleDrag}
        onDrop={handleDrop}
        onBrowseClick={() => fileInputRef.current?.click()}
        patients={mockPatients}
      />

      {/* Preview Modal */}
      <PreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        getFileIcon={getFileIcon}
      />

      {/* Create Document Modal */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setCreateModalTemplate(null)
        }}
        template={createModalTemplate}
        patients={mockPatients}
        onCreateDocument={handleCreateDocument}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteDocId !== null}
        onClose={() => setDeleteDocId(null)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Document Editor — use form renderer for template-based documents, TipTap for free-form */}
      {editingDoc && (
        editingDoc.content && templateHasFormFields(editingDoc.content) ? (
          <DocumentFormRenderer
            templateHtml={editingDoc.content}
            documentName={editingDoc.name}
            onClose={() => setEditingDoc(null)}
            onSave={(_values, renderedHtml) => handleSaveDocument(renderedHtml)}
          />
        ) : (
          <DocumentEditor
            initialContent={editingDoc.content}
            documentName={editingDoc.name}
            onClose={() => setEditingDoc(null)}
            onSave={handleSaveDocument}
          />
        )
      )}
    </div>
    </SectionErrorBoundary>
  )
}
