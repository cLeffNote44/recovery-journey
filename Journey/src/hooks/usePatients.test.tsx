import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  usePatients,
  usePatient,
  usePatientDashboard,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useRegeneratePatientKey,
} from './usePatients'

// Mock the API
vi.mock('../services/api', () => ({
  patientsAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getDashboard: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    regenerateKey: vi.fn(),
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
import { patientsAPI } from '../services/api'
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
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePatients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch patients successfully and mark isFromApi true', async () => {
    const mockPatients = [
      { id: '1', first_name: 'John', last_name: 'Doe', status: 'active' },
      { id: '2', first_name: 'Jane', last_name: 'Smith', status: 'active' },
    ]

    vi.mocked(patientsAPI.getAll).mockResolvedValueOnce({
      success: true,
      patients: mockPatients,
    })

    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.patients).toEqual(mockPatients)
  })

  it('should use placeholder data before API resolves', () => {
    vi.mocked(patientsAPI.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    })

    // Should have placeholder data with isFromApi: false
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
  })

  it('should apply filters when fetching', async () => {
    vi.mocked(patientsAPI.getAll).mockResolvedValueOnce({
      success: true,
      patients: [],
    })

    renderHook(() => usePatients({ status: 'active' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(patientsAPI.getAll).toHaveBeenCalledWith({ status: 'active' })
    })
  })
})

describe('usePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single patient by ID', async () => {
    const mockPatient = { id: '1', first_name: 'John', last_name: 'Doe' }

    vi.mocked(patientsAPI.getById).mockResolvedValueOnce({
      success: true,
      patient: mockPatient,
    })

    const { result } = renderHook(() => usePatient('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(result.current.data?.patient).toEqual(mockPatient)
    expect(patientsAPI.getById).toHaveBeenCalledWith('1')
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => usePatient(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(patientsAPI.getById).not.toHaveBeenCalled()
  })

  it('should use placeholder data while loading', () => {
    vi.mocked(patientsAPI.getById).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => usePatient('1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.isFromApi).toBe(false)
  })
})

describe('usePatientDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch patient dashboard data', async () => {
    const mockDashboard = {
      patient: { id: '1', first_name: 'John' },
      timeline: [{ id: 't1', event: 'Check-in' }],
      checkIns: [{ id: 'c1', date: '2025-01-01' }],
    }

    vi.mocked(patientsAPI.getDashboard).mockResolvedValueOnce({
      success: true,
      ...mockDashboard,
    })

    const { result } = renderHook(() => usePatientDashboard('1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.isFromApi).toBe(true)
    })

    expect(patientsAPI.getDashboard).toHaveBeenCalledWith('1')
  })

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => usePatientDashboard(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(patientsAPI.getDashboard).not.toHaveBeenCalled()
  })
})

describe('useCreatePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a patient successfully', async () => {
    const newPatient = {
      facility_id: 'facility-1',
      first_name: 'New',
      last_name: 'Patient',
      date_of_birth: '1990-01-01',
      sobriety_date: '2025-01-01',
    }

    vi.mocked(patientsAPI.create).mockResolvedValueOnce({
      success: true,
      patient: { id: 'new-1', ...newPatient },
      registration_key: 'ABC123',
    })

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync(newPatient)

    expect(patientsAPI.create).toHaveBeenCalledWith(newPatient)
    expect(showToast.success).toHaveBeenCalledWith('Patient created successfully!')
  })

  it('should handle create errors', async () => {
    vi.mocked(patientsAPI.create).mockResolvedValueOnce({
      success: false,
      error: 'Validation failed',
    })

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        facility_id: 'facility-1',
        first_name: 'Test',
        last_name: 'User',
        date_of_birth: '1990-01-01',
        sobriety_date: '2025-01-01',
      })
    ).rejects.toThrow('Validation failed')

    expect(showToast.error).toHaveBeenCalled()
  })
})

describe('useUpdatePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a patient successfully', async () => {
    vi.mocked(patientsAPI.update).mockResolvedValueOnce({
      success: true,
      patient: { id: '1', first_name: 'Updated' },
    })

    const { result } = renderHook(() => useUpdatePatient(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ id: '1', data: { first_name: 'Updated' } })

    expect(patientsAPI.update).toHaveBeenCalledWith('1', { first_name: 'Updated' })
    expect(showToast.success).toHaveBeenCalledWith('Patient updated successfully!')
  })

  it('should handle update errors', async () => {
    vi.mocked(patientsAPI.update).mockResolvedValueOnce({
      success: false,
      error: 'Patient not found',
    })

    const { result } = renderHook(() => useUpdatePatient(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({ id: '999', data: { first_name: 'Updated' } })
    ).rejects.toThrow('Patient not found')
  })
})

describe('useDeletePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a patient successfully', async () => {
    vi.mocked(patientsAPI.delete).mockResolvedValueOnce({
      success: true,
    })

    const { result } = renderHook(() => useDeletePatient(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('1')

    expect(patientsAPI.delete).toHaveBeenCalledWith('1')
    expect(showToast.success).toHaveBeenCalledWith('Patient deleted successfully!')
  })

  it('should handle delete errors', async () => {
    vi.mocked(patientsAPI.delete).mockResolvedValueOnce({
      success: false,
      error: 'Cannot delete patient',
    })

    const { result } = renderHook(() => useDeletePatient(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync('1')).rejects.toThrow('Cannot delete patient')
  })
})

describe('useRegeneratePatientKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should regenerate patient key successfully', async () => {
    vi.mocked(patientsAPI.regenerateKey).mockResolvedValueOnce({
      success: true,
      registration_key: 'NEWKEY123',
    })

    const { result } = renderHook(() => useRegeneratePatientKey(), {
      wrapper: createWrapper(),
    })

    const response = await result.current.mutateAsync('1')

    expect(patientsAPI.regenerateKey).toHaveBeenCalledWith('1')
    expect(showToast.success).toHaveBeenCalledWith('Registration key regenerated!')
    expect(response.registration_key).toBe('NEWKEY123')
  })

  it('should handle regenerate key errors', async () => {
    vi.mocked(patientsAPI.regenerateKey).mockResolvedValueOnce({
      success: false,
      error: 'Key generation failed',
    })

    const { result } = renderHook(() => useRegeneratePatientKey(), {
      wrapper: createWrapper(),
    })

    await expect(result.current.mutateAsync('1')).rejects.toThrow('Key generation failed')
    expect(showToast.error).toHaveBeenCalled()
  })
})
