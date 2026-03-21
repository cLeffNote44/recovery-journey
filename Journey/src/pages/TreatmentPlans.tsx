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
} from 'lucide-react'
import { SectionErrorBoundary } from '../components/ErrorBoundary'
import {
  CreatePlanModal,
  AssignPlanModal,
  EditPlanModal,
  type TreatmentPhase,
  type TreatmentPlan,
} from '../components/TreatmentPlans'

const mockPlans: TreatmentPlan[] = [
  {
    id: '1',
    name: '30-Day Intensive Recovery',
    description: 'Comprehensive 30-day program focusing on detox, counseling, and life skills development.',
    duration: 30,
    durationUnit: 'days',
    phases: [
      { id: '1a', name: 'Detox & Stabilization', duration: 7, durationUnit: 'days', goals: ['Complete medical detox', 'Stabilize physical health'], activities: ['Medical monitoring', 'Individual assessment', 'Group orientation'] },
      { id: '1b', name: 'Intensive Therapy', duration: 14, durationUnit: 'days', goals: ['Identify triggers', 'Develop coping strategies'], activities: ['Daily group therapy', 'Individual counseling', 'Family sessions'] },
      { id: '1c', name: 'Transition Planning', duration: 9, durationUnit: 'days', goals: ['Create aftercare plan', 'Build support network'], activities: ['Aftercare planning', 'Community resource connection', 'Relapse prevention'] },
    ],
    assignedCount: 24,
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: '90-Day Extended Care',
    description: 'Extended program for patients requiring longer-term support and deeper therapeutic work.',
    duration: 90,
    durationUnit: 'days',
    phases: [
      { id: '2a', name: 'Foundation', duration: 4, durationUnit: 'weeks', goals: ['Establish routine', 'Build trust'], activities: ['Orientation', 'Assessment', 'Goal setting'] },
      { id: '2b', name: 'Core Treatment', duration: 6, durationUnit: 'weeks', goals: ['Address root causes', 'Build skills'], activities: ['Intensive therapy', 'Skills workshops', 'Peer support'] },
      { id: '2c', name: 'Integration', duration: 3, durationUnit: 'weeks', goals: ['Apply learnings', 'Prepare for discharge'], activities: ['Community integration', 'Employment support', 'Family reconciliation'] },
    ],
    assignedCount: 18,
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: '3',
    name: 'Outpatient Recovery Track',
    description: 'Flexible outpatient program for patients transitioning from inpatient care.',
    duration: 12,
    durationUnit: 'weeks',
    phases: [
      { id: '3a', name: 'Intensive Outpatient', duration: 4, durationUnit: 'weeks', goals: ['Maintain sobriety', 'Continue therapy'], activities: ['3x weekly group', 'Weekly individual', 'Drug testing'] },
      { id: '3b', name: 'Standard Outpatient', duration: 8, durationUnit: 'weeks', goals: ['Build independence', 'Strengthen support'], activities: ['2x weekly group', 'Bi-weekly individual', 'Support meetings'] },
    ],
    assignedCount: 32,
    status: 'active',
    createdAt: '2025-03-10',
  },
  {
    id: '4',
    name: 'Dual Diagnosis Program',
    description: 'Specialized program for patients with co-occurring mental health disorders.',
    duration: 60,
    durationUnit: 'days',
    phases: [],
    assignedCount: 0,
    status: 'draft',
    createdAt: '2025-11-01',
  },
]

const mockPatients = [
  { id: '1', name: 'John Doe', currentPlan: '30-Day Intensive Recovery' },
  { id: '2', name: 'Jane Smith', currentPlan: null },
  { id: '3', name: 'Michael Brown', currentPlan: '90-Day Extended Care' },
  { id: '4', name: 'Sarah Davis', currentPlan: null },
  { id: '5', name: 'David Wilson', currentPlan: 'Outpatient Recovery Track' },
]

export default function TreatmentPlans() {
  const [plans, setPlans] = useState(mockPlans)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null)
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null)

  // New plan form state
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    duration: 30,
    durationUnit: 'days' as 'days' | 'weeks' | 'months',
    phases: [] as TreatmentPhase[],
  })

  const filteredPlans = plans
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

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

  const handleCreatePlan = () => {
    const plan: TreatmentPlan = {
      id: Date.now().toString(),
      ...newPlan,
      assignedCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPlans([plan, ...plans])
    setShowCreateModal(false)
    setNewPlan({ name: '', description: '', duration: 30, durationUnit: 'days', phases: [] })
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
      phases: newPlan.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p),
    })
  }

  const removePhase = (phaseId: string) => {
    setNewPlan({ ...newPlan, phases: newPlan.phases.filter(p => p.id !== phaseId) })
  }

  const duplicatePlan = (plan: TreatmentPlan) => {
    const duplicate: TreatmentPlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name} (Copy)`,
      assignedCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPlans([duplicate, ...plans])
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.filter(p => p.status === 'active').length}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.filter(p => p.status === 'draft').length}</p>
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
                <button
                  onClick={() => { setSelectedPlan(plan); setShowAssignModal(true) }}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg"
                >
                  Assign to Patient
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicatePlan(plan)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
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
        patients={mockPatients}
      />

      {/* Edit Plan Modal */}
      <EditPlanModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={() => setEditingPlan(null)}
      />
    </div>
    </SectionErrorBoundary>
  )
}
