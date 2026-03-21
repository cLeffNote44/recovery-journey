import { useState } from 'react'
import { Modal } from '../ui/Modal'
import type { DocumentTemplate } from '../../data/documentTemplates'

interface CreateDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  template: DocumentTemplate | null
  patients: { id: string; name: string }[]
  onCreateDocument: (data: {
    title: string
    patientId: string
    patientName: string
    category: string
    templateKey: DocumentTemplate['templateKey']
  }) => void
}

const categoryOptions = [
  { value: 'intake', label: 'Intake' },
  { value: 'medical', label: 'Medical' },
  { value: 'consent', label: 'Consent' },
  { value: 'progress', label: 'Progress' },
  { value: 'discharge', label: 'Discharge' },
  { value: 'other', label: 'Other' },
]

export function CreateDocumentModal({
  isOpen,
  onClose,
  template,
  patients,
  onCreateDocument,
}: CreateDocumentModalProps) {
  const [title, setTitle] = useState('')
  const [patientId, setPatientId] = useState('')
  const [category, setCategory] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // Initialize form when the modal becomes visible with a new template
  const [lastTemplate, setLastTemplate] = useState<string | null>(null)
  if (isOpen && template && template.id !== lastTemplate) {
    setLastTemplate(template.id)
    setTitle(template.name)
    setCategory(template.category)
    setPatientId('')
    setPatientSearch('')
    setShowPatientDropdown(false)
  }
  if (!isOpen && lastTemplate !== null) {
    setLastTemplate(null)
  }

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const selectedPatient = patients.find((p) => p.id === patientId)

  const handleSubmit = () => {
    if (!title.trim() || !patientId) return

    onCreateDocument({
      title: title.trim(),
      patientId,
      patientName: selectedPatient?.name || '',
      category,
      templateKey: template!.templateKey,
    })

    onClose()
  }

  const handleSelectPatient = (patient: { id: string; name: string }) => {
    setPatientId(patient.id)
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
  }

  if (!template) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Document from Template"
      size="lg"
      className="dark:bg-gray-800"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !patientId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Document
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Template info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Creating from template: <strong>{template.name}</strong>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{template.description}</p>
        </div>

        {/* Document Title */}
        <div>
          <label
            htmlFor="doc-title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Document Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Patient Intake Form - John Doe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Patient Select */}
        <div className="relative">
          <label
            htmlFor="doc-patient"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Patient <span className="text-red-500">*</span>
          </label>
          <input
            id="doc-patient"
            type="text"
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value)
              setShowPatientDropdown(true)
              if (!e.target.value) setPatientId('')
            }}
            onFocus={() => setShowPatientDropdown(true)}
            placeholder="Search for a patient..."
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {showPatientDropdown && filteredPatients.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                      patientId === patient.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {patient.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showPatientDropdown && patientSearch && filteredPatients.length === 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No patients found
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="doc-category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="doc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}
