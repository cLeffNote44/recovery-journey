import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import Dashboard from './Dashboard'
import { useAuthStore } from '../stores/authStore'
import { facilityAPI } from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
  facilityAPI: {
    getDashboard: vi.fn(),
  },
}))

// Mock the auth store
vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const mockUser = {
  id: 'test-user',
  email: 'clinician@recover.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'counselor',
  facility_id: 'facility-1',
}

const defaultApiResponse = {
  success: true,
  stats: {
    totalPatients: 42,
    activePatients: 30,
    checkInsToday: 15,
    alertsCount: 5,
    avgDaysSober: 120,
  },
  appointments: [
    { id: '1', patient: 'Jane Smith', date: 'Today', time: '10:00 AM', status: 'confirmed' },
  ],
  messages: [
    { id: '1', from: 'Bob Patient', preview: 'Hello, I have a question...', time: '5m ago' },
  ],
  reminders: [
    { id: '1', title: 'Review Check-ins', description: '3 patients need review', iconType: 'clipboard' },
  ],
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    })
    // Default successful mock
    ;(facilityAPI.getDashboard as ReturnType<typeof vi.fn>).mockResolvedValue(defaultApiResponse)
  })

  describe('Welcome Banner', () => {
    it('should display personalized greeting', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show default greeting when no user name', async () => {
      ;(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: { ...mockUser, first_name: undefined },
      })

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText(/welcome back, clinician/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Stats Cards', () => {
    it('should display total patients stat', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Total Patients')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display check-ins stat', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Check-ins Today')).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display alerts stat', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Alerts')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Loading State', () => {
    it('should show loading skeletons initially', () => {
      ;(facilityAPI.getDashboard as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}) // Never resolves
      )

      render(<Dashboard />)

      // Skeleton elements should be present
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('API Integration', () => {
    it('should call getDashboard with facility_id', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(facilityAPI.getDashboard).toHaveBeenCalledWith('facility-1')
      })
    })

    it('should handle API failure gracefully', async () => {
      ;(facilityAPI.getDashboard as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      )

      render(<Dashboard />)

      // Should show demo data indicator
      await waitFor(() => {
        expect(screen.getByText(/demo data/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Content Sections', () => {
    it('should display appointments section', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display messages section', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Messages')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display reminders section', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Reminders')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})
