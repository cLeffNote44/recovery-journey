import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useFacilityDashboard,
  useAdminStats,
  useAdminFacilities,
  useAdminActivity,
} from './useDashboard'

// Mock the API
vi.mock('../services/api', () => ({
  facilityAPI: {
    getDashboard: vi.fn(),
  },
  superAdminAPI: {
    getStats: vi.fn(),
    getFacilities: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}))

// Import after mocking
import { facilityAPI, superAdminAPI } from '../services/api'

// Create wrapper with fresh QueryClient for each test
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useFacilityDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch facility dashboard data successfully', async () => {
    const mockDashboard = {
      stats: { totalPatients: 50, activePatients: 45 },
      appointments: [{ id: '1', title: 'Appointment 1' }],
      messages: [{ id: 'm1', text: 'Hello' }],
      reminders: [{ id: 'r1', text: 'Reminder' }],
    }

    vi.mocked(facilityAPI.getDashboard).mockResolvedValueOnce({
      success: true,
      ...mockDashboard,
    })

    const { result } = renderHook(() => useFacilityDashboard('facility-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(facilityAPI.getDashboard).toHaveBeenCalledWith('facility-1')
  })

  it('should not fetch when facilityId is undefined', () => {
    const { result } = renderHook(() => useFacilityDashboard(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(facilityAPI.getDashboard).not.toHaveBeenCalled()
  })

  it('should use placeholder data while loading', () => {
    vi.mocked(facilityAPI.getDashboard).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useFacilityDashboard('facility-1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
  })

  it('should handle API errors', async () => {
    vi.mocked(facilityAPI.getDashboard).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useFacilityDashboard('facility-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useAdminStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch admin stats successfully', async () => {
    const mockStats = {
      totalFacilities: 10,
      totalPatients: 500,
      totalStaff: 100,
    }

    vi.mocked(superAdminAPI.getStats).mockResolvedValueOnce({
      success: true,
      stats: mockStats,
    })

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.stats).toEqual(mockStats)
    expect(result.current.data?.isFromApi).toBe(true)
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(superAdminAPI.getStats).mockRejectedValueOnce(
      new Error('Unauthorized')
    )

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAdminFacilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch all facilities successfully', async () => {
    const mockFacilities = [
      { id: '1', name: 'Facility A' },
      { id: '2', name: 'Facility B' },
    ]

    vi.mocked(superAdminAPI.getFacilities).mockResolvedValueOnce({
      success: true,
      facilities: mockFacilities,
    })

    const { result } = renderHook(() => useAdminFacilities(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.facilities).toEqual(mockFacilities)
    expect(result.current.data?.isFromApi).toBe(true)
  })

  it('should handle API errors', async () => {
    vi.mocked(superAdminAPI.getFacilities).mockResolvedValueOnce({
      success: false,
    })

    const { result } = renderHook(() => useAdminFacilities(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAdminActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch recent activity with default limit', async () => {
    const mockActivity = [
      { id: '1', message: 'Activity 1', time: '2025-01-01' },
      { id: '2', message: 'Activity 2', time: '2025-01-02' },
    ]

    vi.mocked(superAdminAPI.getRecentActivity).mockResolvedValueOnce({
      success: true,
      activity: mockActivity,
    })

    const { result } = renderHook(() => useAdminActivity(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(superAdminAPI.getRecentActivity).toHaveBeenCalledWith(20) // default limit
    expect(result.current.data?.activity).toEqual(mockActivity)
  })

  it('should fetch recent activity with custom limit', async () => {
    vi.mocked(superAdminAPI.getRecentActivity).mockResolvedValueOnce({
      success: true,
      activity: [],
    })

    renderHook(() => useAdminActivity(50), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(superAdminAPI.getRecentActivity).toHaveBeenCalledWith(50)
    })
  })

  it('should handle API errors', async () => {
    vi.mocked(superAdminAPI.getRecentActivity).mockResolvedValueOnce({
      success: false,
    })

    const { result } = renderHook(() => useAdminActivity(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
