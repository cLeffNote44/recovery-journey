import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsAPI, PatientFilters, CreatePatientData } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import { mockPatients, mockPatientDetail, mockTimeline, mockCheckIns } from '../data/mockData'
import { showToast } from '../components/Toast'

/**
 * Hook for fetching all patients with filters
 */
export function usePatients(filters: PatientFilters = {}) {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: async () => {
      const response = await patientsAPI.getAll(filters)
      if (response.success && response.patients) {
        return { patients: response.patients, isFromApi: true }
      }
      throw new Error('Failed to fetch patients')
    },
    // Fallback to mock data on error
    placeholderData: { patients: mockPatients, isFromApi: false },
    retry: false, // Don't retry - we have mock data fallback
  })
}

/**
 * Hook for fetching a single patient by ID
 */
export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('No patient ID provided')
      const response = await patientsAPI.getById(id)
      if (response.success && response.patient) {
        return { patient: response.patient, isFromApi: true }
      }
      throw new Error('Failed to fetch patient')
    },
    enabled: !!id,
    placeholderData: id ? { patient: { ...mockPatientDetail, id }, isFromApi: false } : undefined,
    retry: false,
  })
}

/**
 * Hook for fetching patient dashboard data (includes timeline and check-ins)
 */
export function usePatientDashboard(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.patients.dashboard(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('No patient ID provided')
      const response = await patientsAPI.getDashboard(id)
      if (response.success) {
        return {
          patient: response.patient || { ...mockPatientDetail, id },
          timeline: response.timeline || mockTimeline,
          checkIns: response.checkIns || mockCheckIns,
          isFromApi: true,
        }
      }
      throw new Error('Failed to fetch patient dashboard')
    },
    enabled: !!id,
    placeholderData: id
      ? {
          patient: { ...mockPatientDetail, id },
          timeline: mockTimeline,
          checkIns: mockCheckIns,
          isFromApi: false,
        }
      : undefined,
    retry: false,
  })
}

/**
 * Hook for creating a new patient
 * Uses optimistic updates to show the new patient immediately
 */
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePatientData) => {
      const response = await patientsAPI.create(data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to create patient')
    },
    onMutate: async (newPatient) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.lists() })

      // Snapshot the previous value
      const previousPatients = queryClient.getQueryData(queryKeys.patients.lists())

      // Optimistically add the new patient
      queryClient.setQueryData(
        queryKeys.patients.lists(),
        (old: { patients: unknown[]; isFromApi: boolean } | undefined) => {
          if (!old) return old
          const tempPatient = {
            id: `temp-${Date.now()}`,
            ...newPatient,
            status: 'active',
            created_at: new Date().toISOString(),
            _optimistic: true,
          }
          return {
            ...old,
            patients: [tempPatient, ...old.patients],
          }
        }
      )

      return { previousPatients }
    },
    onError: (error: Error, _newPatient, context) => {
      // Rollback on error
      if (context?.previousPatients) {
        queryClient.setQueryData(queryKeys.patients.lists(), context.previousPatients)
      }
      showToast.error(error.message)
    },
    onSuccess: () => {
      showToast.success('Patient created successfully!')
    },
    onSettled: () => {
      // Always refetch to get server data
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() })
    },
  })
}

/**
 * Hook for updating a patient
 * Uses optimistic updates to show changes immediately
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePatientData> }) => {
      const response = await patientsAPI.update(id, data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to update patient')
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.detail(id) })
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.lists() })

      // Snapshot previous values
      const previousPatient = queryClient.getQueryData(queryKeys.patients.detail(id))
      const previousPatients = queryClient.getQueryData(queryKeys.patients.lists())

      // Optimistically update the patient detail
      queryClient.setQueryData(
        queryKeys.patients.detail(id),
        (old: { patient: Record<string, unknown>; isFromApi: boolean } | undefined) => {
          if (!old) return old
          return {
            ...old,
            patient: { ...old.patient, ...data, _optimistic: true },
          }
        }
      )

      // Optimistically update in the list
      queryClient.setQueryData(
        queryKeys.patients.lists(),
        (old: { patients: Array<{ id: string }>; isFromApi: boolean } | undefined) => {
          if (!old) return old
          return {
            ...old,
            patients: old.patients.map((p) =>
              p.id === id ? { ...p, ...data, _optimistic: true } : p
            ),
          }
        }
      )

      return { previousPatient, previousPatients }
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousPatient) {
        queryClient.setQueryData(queryKeys.patients.detail(id), context.previousPatient)
      }
      if (context?.previousPatients) {
        queryClient.setQueryData(queryKeys.patients.lists(), context.previousPatients)
      }
      showToast.error(error.message)
    },
    onSuccess: () => {
      showToast.success('Patient updated successfully!')
    },
    onSettled: (_, __, { id }) => {
      // Always refetch to get server data
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.dashboard(id) })
    },
  })
}

/**
 * Hook for deleting a patient
 * Uses optimistic updates to remove the patient immediately from the UI
 */
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await patientsAPI.delete(id)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to delete patient')
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.lists() })

      // Snapshot previous patients
      const previousPatients = queryClient.getQueryData(queryKeys.patients.lists())

      // Optimistically remove the patient from the list
      queryClient.setQueryData(
        queryKeys.patients.lists(),
        (old: { patients: Array<{ id: string }>; isFromApi: boolean } | undefined) => {
          if (!old) return old
          return {
            ...old,
            patients: old.patients.filter((p) => p.id !== id),
          }
        }
      )

      return { previousPatients }
    },
    onError: (error: Error, _id, context) => {
      // Rollback on error
      if (context?.previousPatients) {
        queryClient.setQueryData(queryKeys.patients.lists(), context.previousPatients)
      }
      showToast.error(error.message)
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.patients.detail(id) })
      showToast.success('Patient deleted successfully!')
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() })
    },
  })
}

/**
 * Hook for regenerating a patient's registration key
 */
export function useRegeneratePatientKey() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await patientsAPI.regenerateKey(id)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to regenerate key')
    },
    onSuccess: () => {
      showToast.success('Registration key regenerated!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}
