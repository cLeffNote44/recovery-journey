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
  FilePlus2,
} from 'lucide-react'
import DocumentEditor from '../components/DocumentEditor'
import { documentTemplates } from '../data/documentTemplates'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { UploadModal, PreviewModal, type Document } from '../components/Documents'

// Mock data moved inline - templates imported from ../data/documentTemplates
const mockDocuments: Document[] = [
  // Patient-specific documents
  { id: '1', name: 'Intake Form - John Doe.docx', type: 'document', category: 'intake', size: '245 KB', uploadedBy: 'Dr. Martinez', uploadedAt: '2025-11-20', patientId: '1', patientName: 'John Doe', content: documentTemplates.patientIntake },
  { id: '2', name: 'Medical History - John Doe.docx', type: 'document', category: 'medical', size: '180 KB', uploadedBy: 'Dr. Martinez', uploadedAt: '2025-11-19', patientId: '1', patientName: 'John Doe', content: documentTemplates.medicalHistory },
  { id: '3', name: 'Biopsychosocial - Jane Smith.docx', type: 'document', category: 'intake', size: '320 KB', uploadedBy: 'Lisa Anderson', uploadedAt: '2025-11-18', patientId: '2', patientName: 'Jane Smith', content: documentTemplates.biopsychosocial },
  { id: '4', name: 'Consent for Treatment - Michael Brown.docx', type: 'document', category: 'consent', size: '124 KB', uploadedBy: 'Dr. Thompson', uploadedAt: '2025-11-17', patientId: '3', patientName: 'Michael Brown', content: documentTemplates.consentTreatment },
  { id: '5', name: 'Treatment Plan - John Doe.docx', type: 'document', category: 'progress', size: '156 KB', uploadedBy: 'Dr. Martinez', uploadedAt: '2025-11-16', patientId: '1', patientName: 'John Doe', content: documentTemplates.treatmentPlan },
  { id: '6', name: 'Progress Note - Week 4 - John Doe.docx', type: 'document', category: 'progress', size: '89 KB', uploadedBy: 'Dr. Martinez', uploadedAt: '2025-11-15', patientId: '1', patientName: 'John Doe', content: documentTemplates.progressNote },
  { id: '7', name: 'Risk Assessment - Sarah Davis.docx', type: 'document', category: 'medical', size: '145 KB', uploadedBy: 'Nurse White', uploadedAt: '2025-11-15', patientId: '4', patientName: 'Sarah Davis', content: documentTemplates.riskAssessment },
  { id: '8', name: 'Discharge Summary - David Wilson.docx', type: 'document', category: 'discharge', size: '198 KB', uploadedBy: 'Dr. Thompson', uploadedAt: '2025-11-14', patientId: '5', patientName: 'David Wilson', content: documentTemplates.dischargeSummary },
  { id: '9', name: 'Aftercare Plan - David Wilson.docx', type: 'document', category: 'discharge', size: '167 KB', uploadedBy: 'Case Manager', uploadedAt: '2025-11-14', patientId: '5', patientName: 'David Wilson', content: documentTemplates.aftercarePlan },
  { id: '10', name: 'HIPAA Authorization - Jane Smith.docx', type: 'document', category: 'consent', size: '98 KB', uploadedBy: 'Admin', uploadedAt: '2025-11-13', patientId: '2', patientName: 'Jane Smith', content: documentTemplates.hipaaConsent },
  { id: '11', name: 'Daily Progress Note - 11-21 - John Doe.docx', type: 'document', category: 'progress', size: '78 KB', uploadedBy: 'Nurse Davis', uploadedAt: '2025-11-21', patientId: '1', patientName: 'John Doe', content: documentTemplates.dailyProgressNote },
  { id: '12', name: 'Group Therapy Note - Coping Skills.docx', type: 'document', category: 'progress', size: '112 KB', uploadedBy: 'Dr. Martinez', uploadedAt: '2025-11-20', content: documentTemplates.groupNote },
  { id: '13', name: 'Incident Report - 11-19.docx', type: 'document', category: 'other', size: '134 KB', uploadedBy: 'Shift Supervisor', uploadedAt: '2025-11-19', content: documentTemplates.incidentReport },

  // Template library
  { id: '100', name: 'TEMPLATE - Patient Intake Form.docx', type: 'document', category: 'intake', size: '245 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.patientIntake },
  { id: '101', name: 'TEMPLATE - Medical History.docx', type: 'document', category: 'medical', size: '180 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.medicalHistory },
  { id: '102', name: 'TEMPLATE - Consent for Treatment.docx', type: 'document', category: 'consent', size: '124 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.consentTreatment },
  { id: '103', name: 'TEMPLATE - HIPAA Authorization.docx', type: 'document', category: 'consent', size: '98 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.hipaaConsent },
  { id: '104', name: 'TEMPLATE - Biopsychosocial Assessment.docx', type: 'document', category: 'intake', size: '320 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.biopsychosocial },
  { id: '105', name: 'TEMPLATE - Risk Assessment.docx', type: 'document', category: 'medical', size: '145 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.riskAssessment },
  { id: '106', name: 'TEMPLATE - Treatment Plan.docx', type: 'document', category: 'progress', size: '156 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.treatmentPlan },
  { id: '107', name: 'TEMPLATE - Progress Note.docx', type: 'document', category: 'progress', size: '89 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.progressNote },
  { id: '108', name: 'TEMPLATE - Group Therapy Note.docx', type: 'document', category: 'progress', size: '112 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.groupNote },
  { id: '109', name: 'TEMPLATE - Daily Progress Note.docx', type: 'document', category: 'progress', size: '78 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.dailyProgressNote },
  { id: '110', name: 'TEMPLATE - Discharge Summary.docx', type: 'document', category: 'discharge', size: '198 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.dischargeSummary },
  { id: '111', name: 'TEMPLATE - Aftercare Plan.docx', type: 'document', category: 'discharge', size: '167 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.aftercarePlan },
  { id: '112', name: 'TEMPLATE - AMA Discharge Form.docx', type: 'document', category: 'discharge', size: '112 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.amaForm },
  { id: '113', name: 'TEMPLATE - Incident Report.docx', type: 'document', category: 'other', size: '134 KB', uploadedBy: 'Admin', uploadedAt: '2025-10-01', content: documentTemplates.incidentReport },

  // Non-editable files (PDFs, images, etc.)
  { id: '200', name: 'Insurance Card - Jane Smith.jpg', type: 'image', category: 'insurance', size: '856 KB', uploadedBy: 'Lisa Anderson', uploadedAt: '2025-11-18', patientId: '2', patientName: 'Jane Smith' },
  { id: '201', name: 'Lab Results - Sarah Davis.pdf', type: 'pdf', category: 'medical', size: '2.1 MB', uploadedBy: 'Nurse White', uploadedAt: '2025-11-15', patientId: '4', patientName: 'Sarah Davis' },
  { id: '202', name: 'Insurance Verification - John Doe.pdf', type: 'pdf', category: 'insurance', size: '445 KB', uploadedBy: 'Billing Dept', uploadedAt: '2025-11-12', patientId: '1', patientName: 'John Doe' },
  { id: '203', name: 'Court Order - Michael Brown.pdf', type: 'pdf', category: 'consent', size: '1.2 MB', uploadedBy: 'Admin', uploadedAt: '2025-11-10', patientId: '3', patientName: 'Michael Brown' },
]

const categories = [
  { id: 'all', name: 'All Documents', icon: Folder, count: mockDocuments.length },
  { id: 'intake', name: 'Intake Forms', icon: FilePlus, count: mockDocuments.filter(d => d.category === 'intake').length },
  { id: 'medical', name: 'Medical Records', icon: FileText, count: mockDocuments.filter(d => d.category === 'medical').length },
  { id: 'consent', name: 'Consent Forms', icon: File, count: mockDocuments.filter(d => d.category === 'consent').length },
  { id: 'insurance', name: 'Insurance', icon: FileSpreadsheet, count: mockDocuments.filter(d => d.category === 'insurance').length },
  { id: 'progress', name: 'Progress Notes', icon: FileText, count: mockDocuments.filter(d => d.category === 'progress').length },
  { id: 'discharge', name: 'Discharge', icon: File, count: mockDocuments.filter(d => d.category === 'discharge').length },
]

export default function Documents() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadCategory, setUploadCategory] = useState('intake')
  const [uploadPatient, setUploadPatient] = useState('')

  const filteredDocuments = documents
    .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 d.patientName?.toLowerCase().includes(searchTerm.toLowerCase()))

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
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[category]}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    )
  }

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
    const newDocs: Document[] = uploadFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' :
            file.type.includes('image') ? 'image' :
            file.type.includes('sheet') ? 'spreadsheet' : 'document',
      category: uploadCategory as Document['category'],
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadedBy: 'You',
      uploadedAt: new Date().toISOString().split('T')[0],
      patientId: uploadPatient || undefined,
      patientName: uploadPatient ? mockPatients.find(p => p.id === uploadPatient)?.name : undefined,
    }))
    setDocuments([...newDocs, ...documents])
    setShowUploadModal(false)
    setUploadFiles([])
    setUploadCategory('intake')
    setUploadPatient('')
  }

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id))
  }

  const handleSaveDocument = (content: string) => {
    if (editingDoc) {
      setDocuments(documents.map(d =>
        d.id === editingDoc.id ? { ...d, content } : d
      ))
      setEditingDoc(null)
    }
  }

  const createNewDocument = () => {
    const newDoc: Document = {
      id: `new-${Date.now()}`,
      name: 'New Document.docx',
      type: 'document',
      category: 'other',
      size: '0 KB',
      uploadedBy: 'You',
      uploadedAt: new Date().toISOString().split('T')[0],
      content: '<h1>New Document</h1><p>Start typing here...</p>',
    }
    setDocuments([newDoc, ...documents])
    setEditingDoc(newDoc)
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

        {/* Quick Upload */}
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
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage patient files and records</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createNewDocument}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <FilePlus2 className="w-5 h-5" />
              New Document
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <label htmlFor="document-search" className="sr-only">Search documents or patients</label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              id="document-search"
              type="text"
              placeholder="Search documents or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
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
        </div>

        {/* Documents */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                {filteredDocuments.map((doc) => (
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
                        <div className="text-xs text-gray-500">by {doc.uploadedBy}</div>
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
                          onClick={() => deleteDocument(doc.id)}
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
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-3">
                  {getFileIcon(doc.type)}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm text-center truncate mb-2">
                  {doc.name}
                </p>
                <div className="flex justify-center mb-3">
                  {getCategoryBadge(doc.category)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
                  {doc.size} • {doc.uploadedAt}
                </div>
                <div className="flex justify-center gap-2">
                  {doc.type === 'document' ? (
                    <button
                      onClick={() => setEditingDoc(doc)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No documents found</p>
          </div>
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

      {/* Document Editor */}
      {editingDoc && (
        <DocumentEditor
          initialContent={editingDoc.content}
          documentName={editingDoc.name}
          onClose={() => setEditingDoc(null)}
          onSave={handleSaveDocument}
        />
      )}
    </div>
    </SectionErrorBoundary>
  )
}

const mockPatients = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Michael Brown' },
  { id: '4', name: 'Sarah Davis' },
  { id: '5', name: 'David Wilson' },
]
