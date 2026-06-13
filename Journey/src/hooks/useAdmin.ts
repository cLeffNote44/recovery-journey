import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminAPI, CreateFacilityData, CreateAdminData } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import { showToast } from '../components/Toast'

// =============================================================================
// ADMIN STATS
// =============================================================================

/**
 * Hook for fetching admin dashboard statistics
 */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => {
      const response = await superAdminAPI.getStats()
      if (response.success) {
        return { stats: response.stats, isFromApi: true }
      }
      throw new Error('Failed to fetch admin stats')
    },
    // Fallback for development
    placeholderData: {
      stats: {
        totalFacilities: 0,
        activeFacilities: 0,
        totalPatients: 0,
        totalClinicians: 0,
        totalAdmins: 0,
      },
      isFromApi: false,
    },
    retry: false,
  })
}

// =============================================================================
// FACILITIES
// =============================================================================

interface FacilityFilters {
  status?: string
}

/**
 * Hook for fetching all facilities
 */
export function useAdminFacilities(filters: FacilityFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.facilities(), filters],
    queryFn: async () => {
      const response = await superAdminAPI.getFacilities(filters)
      if (response.success) {
        return { facilities: response.facilities, isFromApi: true }
      }
      throw new Error('Failed to fetch facilities')
    },
    placeholderData: { facilities: [], isFromApi: false },
    retry: false,
  })
}

/**
 * Hook for fetching a single facility
 */
export function useAdminFacility(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.facilities.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('No facility ID provided')
      const response = await superAdminAPI.getFacility(id)
      if (response.success) {
        return { facility: response.facility, isFromApi: true }
      }
      throw new Error('Failed to fetch facility')
    },
    enabled: !!id,
    retry: false,
  })
}

/**
 * Hook for creating a new facility
 */
export function useCreateFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateFacilityData) => {
      const response = await superAdminAPI.createFacility(data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to create facility')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.facilities() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
      showToast.success('Facility created successfully!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

/**
 * Hook for updating a facility
 */
export function useUpdateFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFacilityData> }) => {
      const response = await superAdminAPI.updateFacility(id, data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to update facility')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.facilities() })
      queryClient.invalidateQueries({ queryKey: queryKeys.facilities.detail(variables.id) })
      showToast.success('Facility updated successfully!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

/**
 * Hook for suspending a facility
 */
export function useSuspendFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await superAdminAPI.suspendFacility(id)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to suspend facility')
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.facilities() })
      queryClient.invalidateQueries({ queryKey: queryKeys.facilities.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
      showToast.success('Facility suspended')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

// =============================================================================
// ADMINISTRATORS
// =============================================================================

/**
 * Hook for fetching all administrators
 */
export function useAdminAdministrators() {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'administrators'],
    queryFn: async () => {
      const response = await superAdminAPI.getAdministrators()
      if (response.success) {
        return { administrators: response.administrators, isFromApi: true }
      }
      throw new Error('Failed to fetch administrators')
    },
    placeholderData: { administrators: [], isFromApi: false },
    retry: false,
  })
}

/**
 * Hook for creating a new administrator
 */
export function useCreateAdministrator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAdminData) => {
      const response = await superAdminAPI.createAdministrator(data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to create administrator')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
      showToast.success('Administrator created successfully!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

/**
 * Hook for creating a new clinician (counselor)
 */
export function useCreateClinician() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAdminData) => {
      const response = await superAdminAPI.createClinician(data)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to create clinician')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clinicians() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
      showToast.success('Clinician created successfully!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

/**
 * Hook for resetting an admin password
 */
export function useResetAdminPassword() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await superAdminAPI.resetAdminPassword(id)
      if (response.success) {
        return response
      }
      throw new Error(response.error || 'Failed to reset password')
    },
    onSuccess: () => {
      showToast.success('Password reset email sent!')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })
}

// =============================================================================
// CLINICIANS & PATIENTS (Cross-facility)
// =============================================================================

interface ClinicianFilters {
  role?: string
  facility_id?: string
}

/**
 * Hook for fetching all clinicians across facilities
 */
export function useAdminClinicians(filters: ClinicianFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.clinicians(), filters],
    queryFn: async () => {
      const response = await superAdminAPI.getAllClinicians(filters)
      if (response.success) {
        return { clinicians: response.clinicians, isFromApi: true }
      }
      throw new Error('Failed to fetch clinicians')
    },
    placeholderData: { clinicians: [], isFromApi: false },
    retry: false,
  })
}

interface AdminPatientFilters {
  status?: string
  facility_id?: string
}

/**
 * Hook for fetching all patients across facilities (admin view)
 */
export function useAdminPatients(filters: AdminPatientFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.patients(), filters],
    queryFn: async () => {
      const response = await superAdminAPI.getAllPatients(filters)
      if (response.success) {
        return { patients: response.patients, isFromApi: true }
      }
      throw new Error('Failed to fetch patients')
    },
    placeholderData: { patients: [], isFromApi: false },
    retry: false,
  })
}

// =============================================================================
// ANALYTICS & ACTIVITY
// =============================================================================

/**
 * Hook for fetching analytics data
 */
export function useAdminAnalytics(timeframe: string = '30d') {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'analytics', timeframe],
    queryFn: async () => {
      const response = await superAdminAPI.getAnalytics(timeframe)
      if (response.success) {
        return { analytics: response.analytics, isFromApi: true }
      }
      throw new Error('Failed to fetch analytics')
    },
    placeholderData: { analytics: null, isFromApi: false },
    retry: false,
  })
}

/**
 * Hook for fetching recent activity
 */
export function useAdminActivity(limit: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.admin.activity(), limit],
    queryFn: async () => {
      const response = await superAdminAPI.getRecentActivity(limit)
      if (response.success) {
        // Backend returns `activities`; tolerate the legacy `activity` key too.
        return { activity: response.activities ?? response.activity, isFromApi: true }
      }
      throw new Error('Failed to fetch activity')
    },
    placeholderData: { activity: [], isFromApi: false },
    retry: false,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })
}
