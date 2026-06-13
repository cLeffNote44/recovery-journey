import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import PatientDetail from './PatientDetail'
import { patientsAPI } from '../services/api'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'patient-123' }),
    useNavigate: () => mockNavigate,
  }
})

// Mock the API
vi.mock('../services/api', () => ({
  patientsAPI: {
    getDashboard: vi.fn(),
  },
}))

const mockPatient = {
  id: 'patient-123',
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@email.com',
  phone: '555-123-4567',
  date_of_birth: '1990-05-15',
  sobriety_date: '2023-06-01',
  status: 'active',
  currentPhase: 'Phase 2 - Active Recovery',
  phaseProgress: 65,
  days_sober: 180,
  check_in_streak: 15,
  total_check_ins: 45,
  overallProgress: 70,
  missedCheckIns: 2,
  riskLevel: 'low',
  counselor: 'Dr. Sarah Johnson',
  counselor_name: 'Dr. Sarah Johnson',
  treatmentPlan: 'Outpatient Recovery Program',
  soberDaysMilestone: 180,
  nextMilestone: 365,
  admission_date: '2023-06-01',
  substances: ['Alcohol', 'Opioids'],
  goals: ['Complete Phase 2', 'Attend all meetings'],
  achievements: [
    { id: '1', name: '30 Days Sober', date: '2023-07-01', icon: 'award' },
    { id: '2', name: 'First Check-in', date: '2023-06-02', icon: 'check' },
  ],
}

const mockTimeline = [
  { id: '1', type: 'milestone', title: '30 Days Sober', description: 'Reached first milestone', date: '2023-07-01', icon: 'award' },
  { id: '2', type: 'check-in', title: 'Daily Check-in', description: 'Mood: Good', date: '2023-12-15', icon: 'check' },
]

const mockCheckIns = [
  { id: '1', date: '2023-12-15', mood: 5, notes: 'Feeling great today', cravingLevel: 2, triggers: [], copingStrategies: ['meditation'] },
  { id: '2', date: '2023-12-14', mood: 4, notes: 'Slight stress', cravingLevel: 3, triggers: ['work'], copingStrategies: ['exercise'] },
]

const successfulApiResponse = {
  success: true,
  patient: mockPatient,
  timeline: mockTimeline,
  checkIns: mockCheckIns,
}

describe('PatientDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default successful mock
    ;(patientsAPI.getDashboard as ReturnType<typeof vi.fn>).mockResolvedValue(successfulApiResponse)
  })

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      // Make the promise hang
      (patientsAPI.getDashboard as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {})
      )

      render(<PatientDetail />)

      expect(screen.getByText(/loading patient details/i)).toBeInTheDocument()
    })
  })

  describe('Patient Header', () => {
    it('should display patient name after loading', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display patient status badge', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        expect(screen.getByText('active')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Patient Stats', () => {
    it('should display days sober stat card', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        // Look for Days Sober label
        expect(screen.getByText(/days sober/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should display check-in streak stat card', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        // Look for Check-in Streak label
        expect(screen.getByText(/check-in streak/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Tab Navigation', () => {
    it('should display overview tab by default', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        const overviewTab = screen.getByRole('button', { name: /overview/i })
        expect(overviewTab).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should have timeline tab', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should have check-ins tab', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check-ins/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('API Integration', () => {
    it('should call getDashboard with patient ID', async () => {
      render(<PatientDetail />)

      await waitFor(() => {
        expect(patientsAPI.getDashboard).toHaveBeenCalledWith('patient-123')
      })
    })

    it('should handle API failure gracefully', async () => {
      (patientsAPI.getDashboard as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      )

      render(<PatientDetail />)

      // Should fall back to mock data and still render
      await waitFor(() => {
        expect(screen.getByText(/patient profile/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})
