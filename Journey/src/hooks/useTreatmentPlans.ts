import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  treatmentPlansAPI,
  type TreatmentPlanFilters,
  type CreateTreatmentPlanData,
  type UpdateTreatmentPlanData,
  type AssignTreatmentPlanData,
  type PlanDurationUnit,
  type PlanStatus,
  type TreatmentPhaseInput,
} from '../services/api'
import { queryKeys } from '../lib/queryClient'
import { showToast } from '../components/Toast'
import type {
  TreatmentPlan,
  TreatmentPhase,
  NewPlanFormData,
} from '../components/TreatmentPlans'

// ============================================================================
// ENUM MAPPING (backend UPPERCASE <-> client lowercase)
// ============================================================================

type ClientUnit = 'days' | 'weeks' | 'months'
type ClientStatus = 'active' | 'draft' | 'archived'

function toClientUnit(unit: string | undefined): ClientUnit {
  return (unit || 'DAYS').toLowerCase() as ClientUnit
}

export function toBackendUnit(unit: string | undefined): PlanDurationUnit {
  return (unit || 'days').toUpperCase() as PlanDurationUnit
}

function toClientStatus(status: string | undefined): ClientStatus {
  return (status || 'DRAFT').toLowerCase() as ClientStatus
}

export function toBackendStatus(status: string | undefined): PlanStatus {
  return (status || 'draft').toUpperCase() as PlanStatus
}

interface BackendPhase {
  id: string
  name: string
  duration: number
  durationUnit: string
  goals?: string[]
  activities?: string[]
}

interface BackendPlan {
  id: string
  name: string
  description?: string | null
  duration: number
  durationUnit: string
  status: string
  phases?: BackendPhase[]
  assignedCount?: number
  _count?: { assignments: number }
  createdAt?: string
}

/** Map a backend treatment plan (UPPERCASE enums) to the client shape. */
function mapBackendPlan(p: BackendPlan): TreatmentPlan {
  const createdAt = p.createdAt ? p.createdAt.split('T')[0] : ''
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    duration: p.duration,
    durationUnit: toClientUnit(p.durationUnit),
    phases: (p.phases ?? []).map(
      (ph): TreatmentPhase => ({
        id: ph.id,
        name: ph.name,
        duration: ph.duration,
        durationUnit: toClientUnit(ph.durationUnit),
        goals: ph.goals ?? [],
        activities: ph.activities ?? [],
      })
    ),
    assignedCount: p.assignedCount ?? p._count?.assignments ?? 0,
    status: toClientStatus(p.status),
    createdAt,
  }
}

/** Map a client-authored phase to the backend create/update input shape. */
function toBackendPhase(phase: TreatmentPhase): TreatmentPhaseInput {
  return {
    name: phase.name,
    duration: phase.duration,
    durationUnit: toBackendUnit(phase.durationUnit),
    goals: phase.goals,
    activities: phase.activities,
  }
}

/** Build a backend create payload from the client new-plan form. */
export function toCreatePayload(
  form: NewPlanFormData,
  facilityId: string
): CreateTreatmentPlanData {
  return {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    duration: form.duration,
    durationUnit: toBackendUnit(form.durationUnit),
    phases: form.phases.map(toBackendPhase),
    facilityId,
  }
}

// ============================================================================
// MOCK FALLBACK (used when the API is unavailable — mirrors patients pattern)
// ============================================================================

export const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: 'mock-1',
    name: '30-Day Intensive Recovery',
    description:
      'Comprehensive 30-day program focusing on detox, counseling, and life skills development.',
    duration: 30,
    durationUnit: 'days',
    phases: [
      { id: 'mock-1a', name: 'Detox & Stabilization', duration: 7, durationUnit: 'days', goals: ['Complete medical detox', 'Stabilize physical health'], activities: ['Medical monitoring', 'Individual assessment', 'Group orientation'] },
      { id: 'mock-1b', name: 'Intensive Therapy', duration: 14, durationUnit: 'days', goals: ['Identify triggers', 'Develop coping strategies'], activities: ['Daily group therapy', 'Individual counseling', 'Family sessions'] },
      { id: 'mock-1c', name: 'Transition Planning', duration: 9, durationUnit: 'days', goals: ['Create aftercare plan', 'Build support network'], activities: ['Aftercare planning', 'Community resource connection', 'Relapse prevention'] },
    ],
    assignedCount: 24,
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'mock-2',
    name: '90-Day Extended Care',
    description:
      'Extended program for patients requiring longer-term support and deeper therapeutic work.',
    duration: 90,
    durationUnit: 'days',
    phases: [
      { id: 'mock-2a', name: 'Foundation', duration: 4, durationUnit: 'weeks', goals: ['Establish routine', 'Build trust'], activities: ['Orientation', 'Assessment', 'Goal setting'] },
      { id: 'mock-2b', name: 'Core Treatment', duration: 6, durationUnit: 'weeks', goals: ['Address root causes', 'Build skills'], activities: ['Intensive therapy', 'Skills workshops', 'Peer support'] },
      { id: 'mock-2c', name: 'Integration', duration: 3, durationUnit: 'weeks', goals: ['Apply learnings', 'Prepare for discharge'], activities: ['Community integration', 'Employment support', 'Family reconciliation'] },
    ],
    assignedCount: 18,
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'mock-3',
    name: 'Outpatient Recovery Track',
    description: 'Flexible outpatient program for patients transitioning from inpatient care.',
    duration: 12,
    durationUnit: 'weeks',
    phases: [
      { id: 'mock-3a', name: 'Intensive Outpatient', duration: 4, durationUnit: 'weeks', goals: ['Maintain sobriety', 'Continue therapy'], activities: ['3x weekly group', 'Weekly individual', 'Drug testing'] },
      { id: 'mock-3b', name: 'Standard Outpatient', duration: 8, durationUnit: 'weeks', goals: ['Build independence', 'Strengthen support'], activities: ['2x weekly group', 'Bi-weekly individual', 'Support meetings'] },
    ],
    assignedCount: 32,
    status: 'active',
    createdAt: '2025-03-10',
  },
  {
    id: 'mock-4',
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

// ============================================================================
// QUERY HOOK
// ============================================================================

interface UseTreatmentPlansResult {
  plans: TreatmentPlan[]
  isFromApi: boolean
}

/**
 * Fetch treatment plans for the facility. Falls back to mock data with an
 * `isFromApi: false` flag when the API is unavailable (same pattern as
 * usePatients), so the page can show a "demo data" banner.
 */
export function useTreatmentPlans(filters: TreatmentPlanFilters = {}) {
  return useQuery<UseTreatmentPlansResult>({
    queryKey: queryKeys.treatmentPlans.list(filters),
    queryFn: async () => {
      // Resolve (never reject) with a mock fallback so the page can show demo
      // data with a banner when the API is unavailable. React Query v5 drops
      // `placeholderData` once a query reaches the error state, so we must
      // return the fallback here rather than rely on the placeholder.
      try {
        const response = await treatmentPlansAPI.getAll(filters)
        if (response.success && Array.isArray(response.treatmentPlans)) {
          return {
            plans: response.treatmentPlans.map(mapBackendPlan),
            isFromApi: true,
          }
        }
        return { plans: mockTreatmentPlans, isFromApi: false }
      } catch {
        return { plans: mockTreatmentPlans, isFromApi: false }
      }
    },
    // Shown instantly on first paint; swapped for real data once the fetch
    // settles (suppressed from the banner while isLoading is true).
    placeholderData: { plans: mockTreatmentPlans, isFromApi: false },
    retry: false,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/** Create a new (DRAFT) treatment plan. */
export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTreatmentPlanData) => {
      const response = await treatmentPlansAPI.create(data)
      if (response.success) return response
      throw new Error(response.error || 'Failed to create treatment plan')
    },
    onSuccess: () => {
      showToast.success('Treatment plan created as a draft.')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans.lists() })
    },
  })
}

/** Update a treatment plan (edit fields, activate, or archive via status). */
export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTreatmentPlanData }) => {
      const response = await treatmentPlansAPI.update(id, data)
      if (response.success) return response
      throw new Error(response.error || 'Failed to update treatment plan')
    },
    onSuccess: (_res, { data }) => {
      if (data.status === 'ACTIVE') {
        showToast.success('Treatment plan activated — it can now be assigned.')
      } else {
        showToast.success('Treatment plan updated.')
      }
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
    onSettled: (_res, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans.detail(id) })
    },
  })
}

/** Assign a treatment plan to a patient (plan must be ACTIVE). */
export function useAssignTreatmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AssignTreatmentPlanData) => {
      const response = await treatmentPlansAPI.assign(data)
      if (response.success) return response
      throw new Error(response.error || 'Failed to assign treatment plan')
    },
    onSuccess: () => {
      showToast.success('Treatment plan assigned to patient.')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
    onSettled: () => {
      // Assigned count changes on the plan, and the patient's current plan
      // changes too, so refresh both lists.
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
    },
  })
}

/** Archive (soft-delete) a treatment plan. */
export function useArchiveTreatmentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await treatmentPlansAPI.archive(id)
      if (response.success) return response
      throw new Error(response.error || 'Failed to archive treatment plan')
    },
    onSuccess: () => {
      showToast.success('Treatment plan archived.')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans.lists() })
    },
  })
}
