import {
  FileText,
  Upload,
  Download,
  X,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Document {
  id: string
  name: string
  type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'other'
  category: 'intake' | 'medical' | 'consent' | 'insurance' | 'progress' | 'discharge' | 'other'
  size: string
  uploadedBy: string
  uploadedAt: string
  patientId?: string
  patientName?: string
  content?: string
}

export interface Patient {
  id: string
  name: string
}

// ============================================================================
// UPLOAD MODAL COMPONENT
// ============================================================================

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  uploadFiles: File[]
  setUploadFiles: (files: File[]) => void
  uploadCategory: string
  setUploadCategory: (category: string) => void
  uploadPatient: string
  setUploadPatient: (patient: string) => void
  onUpload: () => void
  dragActive: boolean
  onDrag: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onBrowseClick: () => void
  patients: Patient[]
}

export function UploadModal({
  isOpen,
  onClose,
  uploadFiles,
  setUploadFiles,
  uploadCategory,
  setUploadCategory,
  uploadPatient,
  setUploadPatient,
  onUpload,
  dragActive,
  onDrag,
  onDrop,
  onBrowseClick,
  patients,
}: UploadModalProps) {
  if (!isOpen) return null

  const handleClose = () => {
    setUploadFiles([])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="upload-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Upload Document
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {uploadFiles.length > 0 ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Files
            </label>
            <div className="space-y-2" role="list" aria-label="Selected files for upload">
              {uploadFiles.map((file, idx) => (
                <div
                  key={idx}
                  role="listitem"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-gray-500" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-500"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`mb-4 p-8 border-2 border-dashed rounded-lg text-center ${
              dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop files here</p>
            <button
              onClick={onBrowseClick}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse files
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="upload-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="upload-category"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="intake">Intake Form</option>
              <option value="medical">Medical Record</option>
              <option value="consent">Consent Form</option>
              <option value="insurance">Insurance</option>
              <option value="progress">Progress Notes</option>
              <option value="discharge">Discharge</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="upload-patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient (Optional)
            </label>
            <select
              id="upload-patient"
              value={uploadPatient}
              onChange={(e) => setUploadPatient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">No specific patient (template)</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={uploadFiles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PREVIEW MODAL COMPONENT
// ============================================================================

interface PreviewModalProps {
  document: Document | null
  onClose: () => void
  getFileIcon: (type: string) => React.ReactNode
}

export function PreviewModal({ document, onClose, getFileIcon }: PreviewModalProps) {
  if (!document) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="preview-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Document Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close preview modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 mb-4 flex flex-col items-center justify-center min-h-[300px]"
          aria-label="Document preview area"
        >
          {getFileIcon(document.type)}
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preview not available</p>
          <p className="text-sm text-gray-500">Click download to view the file</p>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">File Name</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{document.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Size</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{document.size}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Category</dt>
            <dd className="font-medium text-gray-900 dark:text-white capitalize">{document.category}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Patient</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{document.patientName || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Uploaded By</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{document.uploadedBy}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Upload Date</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{document.uploadedAt}</dd>
          </div>
        </dl>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
