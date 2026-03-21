import { useQuery } from '@tanstack/react-query'
import { facilityAPI, superAdminAPI } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import {
  mockDashboardStats,
  mockAppointments,
  mockDashboardMessages,
  mockReminders,
} from '../data/mockData'

/**
 * Hook for fetching facility dashboard data
 */
export function useFacilityDashboard(facilityId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dashboard.facility(facilityId || ''),
    queryFn: async () => {
      if (!facilityId) throw new Error('No facility ID provided')
      const response = await facilityAPI.getDashboard(facilityId)
      if (response.success) {
        return {
          stats: response.stats || mockDashboardStats,
          appointments: response.appointments || mockAppointments,
          messages: response.messages || mockDashboardMessages,
          reminders: response.reminders || mockReminders,
          isFromApi: true,
        }
      }
      throw new Error('Failed to fetch dashboard')
    },
    enabled: !!facilityId,
    placeholderData: {
      stats: mockDashboardStats,
      appointments: mockAppointments,
      messages: mockDashboardMessages,
      reminders: mockReminders,
      isFromApi: false,
    },
    retry: false,
  })
}

/**
 * Hook for fetching admin stats
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
    retry: false,
  })
}

/**
 * Hook for fetching all facilities (admin)
 */
export function useAdminFacilities() {
  return useQuery({
    queryKey: queryKeys.admin.facilities(),
    queryFn: async () => {
      const response = await superAdminAPI.getFacilities()
      if (response.success) {
        return { facilities: response.facilities, isFromApi: true }
      }
      throw new Error('Failed to fetch facilities')
    },
    retry: false,
  })
}

/**
 * Hook for fetching recent activity (admin)
 */
export function useAdminActivity(limit: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.admin.activity(), limit],
    queryFn: async () => {
      const response = await superAdminAPI.getRecentActivity(limit)
      if (response.success) {
        return { activity: response.activity, isFromApi: true }
      }
      throw new Error('Failed to fetch activity')
    },
    retry: false,
  })
}
