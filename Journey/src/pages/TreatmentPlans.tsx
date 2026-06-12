import { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Copy,
  Play,
  AlertTriangle,
} from 'lucide-react'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import { ConfirmModal } from '../components/ui/Modal'
import {
  CreatePlanModal,
  AssignPlanModal,
  EditPlanModal,
  type TreatmentPhase,
  type TreatmentPlan,
  type NewPlanFormData,
  type EditPlanUpdates,
} from '../components/TreatmentPlans'
import {
  useTreatmentPlans,
  useCreateTreatmentPlan,
  useUpdateTreatmentPlan,
  useAssignTreatmentPlan,
  useArchiveTreatmentPlan,
  toCreatePayload,
  toBackendStatus,
  usePatients,
} from '../hooks'
import { useAuthStore } from '../stores/authStore'
import { showToast } from '../components/Toast'

interface AssignablePatient {
  id: string
  name: string
  currentPlan: string | null
}

export default function TreatmentPlans() {
  const facilityId = useAuthStore((s) => s.user?.facility_id)

  const { data, isLoading } = useTreatmentPlans(facilityId ? { facilityId } : {})
  const plans = data?.plans ?? []
  // Only surface the "demo data" banner once the query has settled, so it
  // doesn't flash during the initial load while placeholder data is showing.
  const isUsingMockData = !isLoading && !!data && !data.isFromApi

  const createPlan = useCreateTreatmentPlan()
  const updatePlan = useUpdateTreatmentPlan()
  const assignPlan = useAssignTreatmentPlan()
  const archivePlan = useArchiveTreatmentPlan()

  // Patients for the assign modal.
  const { data: patientsData } = usePatients()
  const assignablePatients: AssignablePatient[] = (patientsData?.patients ?? []).map(
    (p: Record<string, unknown>) => ({
      id: p.id as string,
      name: `${(p.firstName || p.first_name || '') as string} ${(p.lastName || p.last_name || '') as string}`.trim() || 'Unnamed patient',
      currentPlan: null,
    })
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null)
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null)
  const [planToArchive, setPlanToArchive] = useState<TreatmentPlan | null>(null)

  // New plan form state
  const emptyForm: NewPlanFormData = {
    name: '',
    description: '',
    duration: 30,
    durationUnit: 'days',
    phases: [],
  }
  const [newPlan, setNewPlan] = useState<NewPlanFormData>(emptyForm)

  const filteredPlans = plans
    .filter((p) => statusFilter === 'all' || p.status === statusFilter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const requireFacility = (): boolean => {
    if (!facilityId) {
      showToast.error('No facility context found. Please sign in again.')
      return false
    }
    return true
  }

  const handleCreatePlan = () => {
    if (!newPlan.name.trim()) {
      showToast.error('Give the plan a name first.')
      return
    }
    if (newPlan.phases.length === 0) {
      showToast.error('Add at least one phase before creating the plan.')
      return
    }
    if (!requireFacility()) return
    createPlan.mutate(toCreatePayload(newPlan, facilityId as string), {
      onSuccess: () => {
        setShowCreateModal(false)
        setNewPlan(emptyForm)
      },
    })
  }

  const addPhase = () => {
    const newPhase: TreatmentPhase = {
      id: Date.now().toString(),
      name: `Phase ${newPlan.phases.length + 1}`,
      duration: 7,
      durationUnit: 'days',
      goals: [],
      activities: [],
    }
    setNewPlan({ ...newPlan, phases: [...newPlan.phases, newPhase] })
  }

  const updatePhase = (phaseId: string, updates: Partial<TreatmentPhase>) => {
    setNewPlan({
      ...newPlan,
      phases: newPlan.phases.map((p) => (p.id === phaseId ? { ...p, ...updates } : p)),
    })
  }

  const removePhase = (phaseId: string) => {
    setNewPlan({ ...newPlan, phases: newPlan.phases.filter((p) => p.id !== phaseId) })
  }

  const duplicatePlan = (plan: TreatmentPlan) => {
    if (plan.phases.length === 0) {
      showToast.error('Cannot duplicate a plan that has no phases.')
      return
    }
    if (!requireFacility()) return
    const form: NewPlanFormData = {
      name: `${plan.name} (Copy)`,
      description: plan.description,
      duration: plan.duration,
      durationUnit: plan.durationUnit,
      phases: plan.phases,
    }
    createPlan.mutate(toCreatePayload(form, facilityId as string))
  }

  const handleActivate = (plan: TreatmentPlan) => {
    updatePlan.mutate({ id: plan.id, data: { status: 'ACTIVE' } })
  }

  const handleEditSave = (updates: EditPlanUpdates) => {
    if (!editingPlan) return
    updatePlan.mutate(
      {
        id: editingPlan.id,
        data: {
          name: updates.name.trim(),
          description: updates.description.trim() || undefined,
          status: toBackendStatus(updates.status),
        },
      },
      { onSuccess: () => setEditingPlan(null) }
    )
  }

  const handleAssign = (patientId: string) => {
    if (!selectedPlan) return
    assignPlan.mutate(
      {
        patientId,
        treatmentPlanId: selectedPlan.id,
        startDate: new Date().toISOString(),
      },
      { onSuccess: () => setShowAssignModal(false) }
    )
  }

  const handleArchiveConfirm = () => {
    if (!planToArchive) return
    archivePlan.mutate(planToArchive.id, {
      onSuccess: () => setPlanToArchive(null),
    })
  }

  return (
    <SectionErrorBoundary>
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Treatment Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage recovery programs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Create Plan
        </button>
      </div>

      {isUsingMockData && (
        <div
          className="mb-6 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2"
          role="status"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Showing demo treatment plans — the server is unavailable, so changes won&apos;t be saved.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Plans</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.filter((p) => p.status === 'active').length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Plans</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.reduce((sum, p) => sum + p.assignedCount, 0)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Patients Enrolled</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.filter((p) => p.status === 'draft').length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <label htmlFor="plan-search" className="sr-only">Search treatment plans</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
          <input
            id="plan-search"
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Empty state */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading treatment plans…' : 'No treatment plans match your filters.'}
          </p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  {getStatusBadge(plan.status)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{plan.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {plan.duration} {plan.durationUnit}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {plan.assignedCount} patients
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {plan.phases.length} phases
              </span>
            </div>

            {plan.phases.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1">
                  {plan.phases.map((phase, idx) => (
                    <div
                      key={phase.id}
                      className="flex-1 h-2 rounded-full bg-blue-100 dark:bg-blue-900"
                      title={phase.name}
                    >
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-blue-500' : 'bg-blue-400'
                        }`}
                        style={{ width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {plan.phases.map((phase) => (
                    <span key={phase.id} className="truncate px-1">{phase.name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {plan.status === 'draft' ? (
                  <button
                    onClick={() => handleActivate(plan)}
                    disabled={updatePlan.isPending}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" aria-hidden="true" />
                    Activate
                  </button>
                ) : (
                  <button
                    onClick={() => { setSelectedPlan(plan); setShowAssignModal(true) }}
                    disabled={plan.status !== 'active'}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign to Patient
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                  aria-label={`Edit ${plan.name}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicatePlan(plan)}
                  disabled={createPlan.isPending}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded disabled:opacity-50"
                  aria-label={`Duplicate ${plan.name}`}
                >
                  <Copy className="w-4 h-4" />
                </button>
                {plan.status !== 'archived' && (
                  <button
                    onClick={() => setPlanToArchive(plan)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
                    aria-label={`Archive ${plan.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePlan}
        newPlan={newPlan}
        setNewPlan={setNewPlan}
        addPhase={addPhase}
        updatePhase={updatePhase}
        removePhase={removePhase}
      />

      {/* Assign Plan Modal */}
      <AssignPlanModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedPlan={selectedPlan}
        patients={assignablePatients}
        onAssign={handleAssign}
        isAssigning={assignPlan.isPending}
      />

      {/* Edit Plan Modal */}
      <EditPlanModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={handleEditSave}
        isSaving={updatePlan.isPending}
      />

      {/* Archive confirmation */}
      <ConfirmModal
        isOpen={!!planToArchive}
        onClose={() => setPlanToArchive(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive treatment plan"
        message={
          planToArchive
            ? `Archive "${planToArchive.name}"? It will no longer be assignable, but existing patient assignments are kept.`
            : ''
        }
        confirmLabel="Archive"
        variant="danger"
        isLoading={archivePlan.isPending}
      />
    </div>
    </SectionErrorBoundary>
  )
}
