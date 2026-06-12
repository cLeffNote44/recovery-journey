import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  useAdminStats,
  useAdminFacilities,
  useAdminFacility,
  useCreateFacility,
  useUpdateFacility,
  useSuspendFacility,
  useAdminAdministrators,
  useCreateAdministrator,
  useResetAdminPassword,
  useAdminClinicians,
  useAdminPatients,
  useAdminAnalytics,
  useAdminActivity,
} from './useAdmin'

// Mock the API
vi.mock('../services/api', () => ({
  superAdminAPI: {
    getStats: vi.fn(),
    getFacilities: vi.fn(),
    getFacility: vi.fn(),
    createFacility: vi.fn(),
    updateFacility: vi.fn(),
    suspendFacility: vi.fn(),
    getAdministrators: vi.fn(),
    createAdministrator: vi.fn(),
    resetAdminPassword: vi.fn(),
    getAllClinicians: vi.fn(),
    getAllPatients: vi.fn(),
    getAnalytics: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}))

// Mock the toast
vi.mock('../components/Toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Import after mocking
import { superAdminAPI } from '../services/api'
import { showToast } from '../components/Toast'

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

describe('useAdminStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch admin stats successfully', async () => {
    const mockStats = {
      totalFacilities: 10,
      activeFacilities: 8,
      totalPatients: 500,
      totalClinicians: 50,
      totalAdmins: 5,
    }

    vi.mocked(superAdminAPI.getStats).mockResolvedValueOnce({
      success: true,
      stats: mockStats,
    })

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.stats).toEqual(mockStats)
  })

  it('should use placeholder data while loading', () => {
    vi.mocked(superAdminAPI.getStats).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useAdminStats(), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
  })

  it('should handle API errors', async () => {
    vi.mocked(superAdminAPI.getStats).mockResolvedValueOnce({
      success: false,
    })

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

  it('should fetch facilities successfully', async () => {
    const mockFacilities = [
      { id: '1', name: 'Facility A', status: 'active' },
      { id: '2', name: 'Facility B', status: 'active' },
    ]

    vi.mocked(superAdminAPI.getFacilities).mockResolvedValueOnce({
      success: true,
      facilities: mockFacilities,
    })

    const { result } = renderHook(() => useAdminFacilities(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.facilities).toEqual(mockFacilities)
  })

  it('should pass filters to API', async () => {
    vi.mocked(superAdminAPI.getFacilities).mockResolvedValueOnce({
      success: true,
      facilities: [],
    })

    renderHook(() => useAdminFacilities({ status: 'active' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(superAdminAPI.getFacilities).toHaveBeenCalledWith({ status: 'active' })
    })
  })
})

describe('useAdminFacility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single facility by ID', async () => {
    const mockFacility = { id: '1', name: 'Test Facility', status: 'active' }

    vi.mocked(superAdminAPI.getFacility).mockResolvedValueOnce({
      success: true,
      facility: mockFacility,
    })

    const { result } = renderHook(() => useAdminFacility('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.facility).toEqual(mockFacility)
    expect(superAdminAPI.getFacility).toHaveBeenCalledWith('1')
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useAdminFacility(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(superAdminAPI.getFacility).not.toHaveBeenCalled()
  })
})

describe('useCreateFacility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create facility successfully', async () => {
    vi.mocked(superAdminAPI.createFacility).mockResolvedValueOnce({
      success: true,
      facility: { id: 'new-1', name: 'New Facility' },
    })

    const { result } = renderHook(() => useCreateFacility(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New Facility',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zip: '90210',
        phone: '555-123-4567',
        email: 'facility@test.com',
      })
    })

    expect(superAdminAPI.createFacility).toHaveBeenCalled()
    expect(showToast.success).toHaveBeenCalledWith('Facility created successfully!')
  })

  it('should handle create errors', async () => {
    vi.mocked(superAdminAPI.createFacility).mockResolvedValueOnce({
      success: false,
      error: 'Validation failed',
    })

    const { result } = renderHook(() => useCreateFacility(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        name: 'Test',
        address: '123 St',
        city: 'Test City',
        state: 'CA',
        zip: '90210',
        phone: '555-123-4567',
        email: 'test@test.com',
      })
    ).rejects.toThrow('Validation failed')

    expect(showToast.error).toHaveBeenCalled()
  })
})

describe('useUpdateFacility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update facility successfully', async () => {
    vi.mocked(superAdminAPI.updateFacility).mockResolvedValueOnce({
      success: true,
      facility: { id: '1', name: 'Updated Facility' },
    })

    const { result } = renderHook(() => useUpdateFacility(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: '1', data: { name: 'Updated Facility' } })
    })

    expect(superAdminAPI.updateFacility).toHaveBeenCalledWith('1', { name: 'Updated Facility' })
    expect(showToast.success).toHaveBeenCalledWith('Facility updated successfully!')
  })
})

describe('useSuspendFacility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should suspend facility successfully', async () => {
    vi.mocked(superAdminAPI.suspendFacility).mockResolvedValueOnce({
      success: true,
    })

    const { result } = renderHook(() => useSuspendFacility(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('1')
    })

    expect(superAdminAPI.suspendFacility).toHaveBeenCalledWith('1')
    expect(showToast.success).toHaveBeenCalledWith('Facility suspended')
  })
})

describe('useAdminAdministrators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch administrators successfully', async () => {
    const mockAdmins = [
      { id: '1', name: 'Admin 1', email: 'admin1@test.com' },
      { id: '2', name: 'Admin 2', email: 'admin2@test.com' },
    ]

    vi.mocked(superAdminAPI.getAdministrators).mockResolvedValueOnce({
      success: true,
      administrators: mockAdmins,
    })

    const { result } = renderHook(() => useAdminAdministrators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.administrators).toEqual(mockAdmins)
  })
})

describe('useCreateAdministrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create administrator successfully', async () => {
    vi.mocked(superAdminAPI.createAdministrator).mockResolvedValueOnce({
      success: true,
      administrator: { id: 'new-1', name: 'New Admin' },
    })

    const { result } = renderHook(() => useCreateAdministrator(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        facility_id: 'facility-1',
        first_name: 'New',
        last_name: 'Admin',
        email: 'newadmin@test.com',
        temp_password: 'TempPass123!',
      })
    })

    expect(showToast.success).toHaveBeenCalledWith('Administrator created successfully!')
  })
})

describe('useResetAdminPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reset password successfully', async () => {
    vi.mocked(superAdminAPI.resetAdminPassword).mockResolvedValueOnce({
      success: true,
    })

    const { result } = renderHook(() => useResetAdminPassword(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('1')
    })

    expect(superAdminAPI.resetAdminPassword).toHaveBeenCalledWith('1')
    expect(showToast.success).toHaveBeenCalledWith('Password reset email sent!')
  })
})

describe('useAdminClinicians', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch clinicians with filters', async () => {
    const mockClinicians = [
      { id: '1', name: 'Clinician 1', role: 'counselor' },
    ]

    vi.mocked(superAdminAPI.getAllClinicians).mockResolvedValueOnce({
      success: true,
      clinicians: mockClinicians,
    })

    const { result } = renderHook(() => useAdminClinicians({ role: 'counselor' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(superAdminAPI.getAllClinicians).toHaveBeenCalledWith({ role: 'counselor' })
    expect(result.current.data?.clinicians).toEqual(mockClinicians)
  })
})

describe('useAdminPatients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch patients with filters', async () => {
    const mockPatients = [
      { id: '1', name: 'Patient 1', status: 'active' },
    ]

    vi.mocked(superAdminAPI.getAllPatients).mockResolvedValueOnce({
      success: true,
      patients: mockPatients,
    })

    const { result } = renderHook(() => useAdminPatients({ status: 'active' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(superAdminAPI.getAllPatients).toHaveBeenCalledWith({ status: 'active' })
    expect(result.current.data?.patients).toEqual(mockPatients)
  })
})

describe('useAdminAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch analytics with timeframe', async () => {
    const mockAnalytics = {
      newPatients: 10,
      completedTreatments: 5,
    }

    vi.mocked(superAdminAPI.getAnalytics).mockResolvedValueOnce({
      success: true,
      analytics: mockAnalytics,
    })

    const { result } = renderHook(() => useAdminAnalytics('7d'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(superAdminAPI.getAnalytics).toHaveBeenCalledWith('7d')
    expect(result.current.data?.analytics).toEqual(mockAnalytics)
  })

  it('should use default 30d timeframe', async () => {
    vi.mocked(superAdminAPI.getAnalytics).mockResolvedValueOnce({
      success: true,
      analytics: {},
    })

    renderHook(() => useAdminAnalytics(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(superAdminAPI.getAnalytics).toHaveBeenCalledWith('30d')
    })
  })
})

describe('useAdminActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch activity with custom limit', async () => {
    const mockActivity = [
      { id: '1', message: 'User logged in', time: '2025-01-01' },
    ]

    vi.mocked(superAdminAPI.getRecentActivity).mockResolvedValueOnce({
      success: true,
      activity: mockActivity,
    })

    const { result } = renderHook(() => useAdminActivity(50), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(superAdminAPI.getRecentActivity).toHaveBeenCalledWith(50)
    expect(result.current.data?.activity).toEqual(mockActivity)
  })

  it('should use default limit of 20', async () => {
    vi.mocked(superAdminAPI.getRecentActivity).mockResolvedValueOnce({
      success: true,
      activity: [],
    })

    renderHook(() => useAdminActivity(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(superAdminAPI.getRecentActivity).toHaveBeenCalledWith(20)
    })
  })
})
