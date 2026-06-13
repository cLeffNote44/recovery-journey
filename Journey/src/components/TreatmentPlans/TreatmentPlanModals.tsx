import { useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  ChevronRight,
  X,
  GripVertical,
  AlertTriangle,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface TreatmentPhase {
  id: string
  name: string
  duration: number
  durationUnit: 'days' | 'weeks' | 'months'
  goals: string[]
  activities: string[]
}

export interface TreatmentPlan {
  id: string
  name: string
  description: string
  duration: number
  durationUnit: 'days' | 'weeks' | 'months'
  phases: TreatmentPhase[]
  assignedCount: number
  status: 'active' | 'draft' | 'archived'
  createdAt: string
}

export interface NewPlanFormData {
  name: string
  description: string
  duration: number
  durationUnit: 'days' | 'weeks' | 'months'
  phases: TreatmentPhase[]
}

interface Patient {
  id: string
  name: string
  currentPlan: string | null
}

// ============================================================================
// CREATE PLAN MODAL
// ============================================================================

interface CreatePlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  newPlan: NewPlanFormData
  setNewPlan: (plan: NewPlanFormData) => void
  addPhase: () => void
  updatePhase: (phaseId: string, updates: Partial<TreatmentPhase>) => void
  removePhase: (phaseId: string) => void
}

export function CreatePlanModal({
  isOpen,
  onClose,
  onSubmit,
  newPlan,
  setNewPlan,
  addPhase,
  updatePhase,
  removePhase,
}: CreatePlanModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-plan-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 id="create-plan-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Create Treatment Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plan Name <span aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="plan-name"
                type="text"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                placeholder="e.g., 30-Day Intensive Recovery"
                aria-required="true"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="plan-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="plan-description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                placeholder="Describe the program goals and approach..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="plan-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  id="plan-duration"
                  type="number"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="plan-duration-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <select
                  id="plan-duration-unit"
                  value={newPlan.durationUnit}
                  onChange={(e) => setNewPlan({ ...newPlan, durationUnit: e.target.value as 'days' | 'weeks' | 'months' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phase Editor */}
          <PhaseEditor
            phases={newPlan.phases}
            onAddPhase={addPhase}
            onUpdatePhase={updatePhase}
            onRemovePhase={removePhase}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newPlan.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Plan
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PHASE EDITOR COMPONENT
// ============================================================================

interface PhaseEditorProps {
  phases: TreatmentPhase[]
  onAddPhase: () => void
  onUpdatePhase: (phaseId: string, updates: Partial<TreatmentPhase>) => void
  onRemovePhase: (phaseId: string) => void
}

export function PhaseEditor({ phases, onAddPhase, onUpdatePhase, onRemovePhase }: PhaseEditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Treatment Phases
        </label>
        <button
          onClick={onAddPhase}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Phase
        </button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400">No phases added yet</p>
          <button
            onClick={onAddPhase}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first phase
          </button>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Treatment phases">
          {phases.map((phase, idx) => (
            <div
              key={phase.id}
              role="listitem"
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3 mb-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" aria-hidden="true" />
                <span
                  className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium"
                  aria-label={`Phase ${idx + 1}`}
                >
                  {idx + 1}
                </span>
                <label htmlFor={`phase-name-${phase.id}`} className="sr-only">Phase name</label>
                <input
                  id={`phase-name-${phase.id}`}
                  type="text"
                  value={phase.name}
                  onChange={(e) => onUpdatePhase(phase.id, { name: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <div className="flex items-center gap-2">
                  <label htmlFor={`phase-duration-${phase.id}`} className="sr-only">Duration</label>
                  <input
                    id={`phase-duration-${phase.id}`}
                    type="number"
                    value={phase.duration}
                    onChange={(e) => onUpdatePhase(phase.id, { duration: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <label htmlFor={`phase-unit-${phase.id}`} className="sr-only">Duration unit</label>
                  <select
                    id={`phase-unit-${phase.id}`}
                    value={phase.durationUnit}
                    onChange={(e) => onUpdatePhase(phase.id, { durationUnit: e.target.value as 'days' | 'weeks' | 'months' })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
                <button
                  onClick={() => onRemovePhase(phase.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${phase.name}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 ml-9">
                <div>
                  <label htmlFor={`phase-goals-${phase.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Goals (one per line)
                  </label>
                  <textarea
                    id={`phase-goals-${phase.id}`}
                    value={phase.goals.join('\n')}
                    onChange={(e) => onUpdatePhase(phase.id, { goals: e.target.value.split('\n').filter(g => g.trim()) })}
                    rows={2}
                    placeholder="Enter goals..."
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label htmlFor={`phase-activities-${phase.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Activities (one per line)
                  </label>
                  <textarea
                    id={`phase-activities-${phase.id}`}
                    value={phase.activities.join('\n')}
                    onChange={(e) => onUpdatePhase(phase.id, { activities: e.target.value.split('\n').filter(a => a.trim()) })}
                    rows={2}
                    placeholder="Enter activities..."
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ASSIGN PLAN MODAL
// ============================================================================

interface AssignPlanModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: TreatmentPlan | null
  patients: Patient[]
  onAssign?: (patientId: string) => void
  isAssigning?: boolean
}

export function AssignPlanModal({
  isOpen,
  onClose,
  selectedPlan,
  patients,
  onAssign,
  isAssigning = false,
}: AssignPlanModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')

  // Reset the selection whenever the modal opens or the target plan changes.
  useEffect(() => {
    if (isOpen) setSelectedPatientId('')
  }, [isOpen, selectedPlan?.id])

  if (!isOpen || !selectedPlan) return null

  const isActive = selectedPlan.status === 'active'
  const canAssign = isActive && !!selectedPatientId && !isAssigning

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-plan-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="assign-plan-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Assign Treatment Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">{selectedPlan.name}</p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            {selectedPlan.duration} {selectedPlan.durationUnit} • {selectedPlan.phases.length} phases
          </p>
        </div>

        {!isActive && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              This plan is a {selectedPlan.status}. Activate it before assigning it to a patient.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Patient
          </label>
          {patients.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No patients available to assign.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto" role="radiogroup" aria-label="Available patients">
              {patients.map((patient) => {
                const disabled = !!patient.currentPlan || !isActive
                const selected = selectedPatientId === patient.id
                return (
                  <label
                    key={patient.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      disabled
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 cursor-not-allowed'
                        : selected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 cursor-pointer'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="assign-patient"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => setSelectedPatientId(patient.id)}
                        className="w-4 h-4 text-blue-600"
                        aria-describedby={patient.currentPlan ? `patient-${patient.id}-plan` : undefined}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                        {patient.currentPlan && (
                          <p id={`patient-${patient.id}-plan`} className="text-xs text-gray-500 dark:text-gray-400">
                            Currently in: {patient.currentPlan}
                          </p>
                        )}
                      </div>
                    </div>
                    {!disabled && !selected && (
                      <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canAssign && onAssign) onAssign(selectedPatientId)
            }}
            disabled={!canAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning…' : 'Assign Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EDIT PLAN MODAL
// ============================================================================

export interface EditPlanUpdates {
  name: string
  description: string
  status: 'active' | 'draft' | 'archived'
}

interface EditPlanModalProps {
  plan: TreatmentPlan | null
  onClose: () => void
  onSave: (updates: EditPlanUpdates) => void
  isSaving?: boolean
}

export function EditPlanModal({ plan, onClose, onSave, isSaving = false }: EditPlanModalProps) {
  const [form, setForm] = useState<EditPlanUpdates>({ name: '', description: '', status: 'draft' })

  // Re-seed the form whenever a different plan is opened for editing.
  useEffect(() => {
    if (plan) {
      setForm({ name: plan.name, description: plan.description, status: plan.status })
    }
  }, [plan])

  if (!plan) return null

  const canSave = form.name.trim().length > 0 && !isSaving

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-plan-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 id="edit-plan-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Treatment Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-plan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan Name
            </label>
            <input
              id="edit-plan-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="edit-plan-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="edit-plan-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="edit-plan-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="edit-plan-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EditPlanUpdates['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (canSave) onSave(form) }}
            disabled={!canSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
