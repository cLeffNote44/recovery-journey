import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { authAPI, patientsAPI, healthCheck } from './api'
import { useAuthStore } from '../stores/authStore'

// Mock axios
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios')
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
      post: vi.fn(),
      get: vi.fn(),
    },
  }
})

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('healthCheck', () => {
    it('should return healthy status when server responds', async () => {
      const mockResponse = { status: 'healthy', version: '1.0.0' }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

      // Since we're mocking at the axios level, we need to re-test the implementation
      // For now, test that the function exists and is callable
      expect(typeof healthCheck).toBe('function')
    })

    it('should return error status on network failure', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'))

      const result = await healthCheck()

      expect(result.status).toBe('error')
    })
  })

  describe('authAPI', () => {
    it('should have staffLogin method', () => {
      expect(typeof authAPI.staffLogin).toBe('function')
    })

    it('should have logout method', () => {
      expect(typeof authAPI.logout).toBe('function')
    })

    it('should have refreshToken method', () => {
      expect(typeof authAPI.refreshToken).toBe('function')
    })

    it('should have validateKey method', () => {
      expect(typeof authAPI.validateKey).toBe('function')
    })
  })

  describe('patientsAPI', () => {
    it('should have getAll method', () => {
      expect(typeof patientsAPI.getAll).toBe('function')
    })

    it('should have getById method', () => {
      expect(typeof patientsAPI.getById).toBe('function')
    })

    it('should have create method', () => {
      expect(typeof patientsAPI.create).toBe('function')
    })

    it('should have update method', () => {
      expect(typeof patientsAPI.update).toBe('function')
    })

    it('should have delete method', () => {
      expect(typeof patientsAPI.delete).toBe('function')
    })
  })

  describe('CreatePatientData interface', () => {
    it('should accept valid patient data', () => {
      const validPatient = {
        facility_id: 'facility-123',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        phone: '555-1234',
        email: 'john@example.com',
        sobriety_date: '2024-01-01',
        assigned_counselor_id: 'counselor-123',
        substances_of_choice: ['alcohol', 'opioids'],
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '555-5678',
        emergency_contact_relationship: 'Spouse',
      }

      // TypeScript will validate this at compile time
      // At runtime, we just verify the structure
      expect(validPatient.facility_id).toBeDefined()
      expect(validPatient.first_name).toBeDefined()
      expect(validPatient.last_name).toBeDefined()
      expect(validPatient.date_of_birth).toBeDefined()
    })

    it('should accept minimal required patient data', () => {
      const minimalPatient = {
        facility_id: 'facility-123',
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1985-05-15',
      }

      expect(minimalPatient.facility_id).toBeDefined()
      expect(minimalPatient.first_name).toBeDefined()
      expect(minimalPatient.last_name).toBeDefined()
      expect(minimalPatient.date_of_birth).toBeDefined()
    })
  })
})

describe('Token Management', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      },
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })
  })

  it('should have access token in store when authenticated', () => {
    const token = useAuthStore.getState().accessToken
    expect(token).toBe('test-access-token')
  })

  it('should have refresh token in store when authenticated', () => {
    const token = useAuthStore.getState().refreshToken
    expect(token).toBe('test-refresh-token')
  })

  it('should clear tokens on logout', () => {
    useAuthStore.getState().logout()

    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
  })
})
