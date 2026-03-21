import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '../test/test-utils'
import LoginPage from './LoginPage'
import { useAuthStore } from '../stores/authStore'
import * as api from '../services/api'

// Mock the API module
vi.mock('../services/api', () => ({
  authAPI: {
    staffLogin: vi.fn(),
  },
  healthCheck: vi.fn(),
}))

// Helper to render LoginPage and wait for initial async effects
async function renderLoginPage() {
  render(<LoginPage />)
  // Wait for initial health check effect to complete
  await waitFor(() => {
    expect(api.healthCheck).toHaveBeenCalled()
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    })
    // Default health check to online
    vi.mocked(api.healthCheck).mockResolvedValue({ status: 'healthy' })
  })

  describe('Rendering', () => {
    it('should render the login form', async () => {
      await renderLoginPage()

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render the Recover branding', async () => {
      await renderLoginPage()

      expect(screen.getAllByText('Recover').length).toBeGreaterThan(0)
      expect(screen.getAllByText(/clinician portal/i).length).toBeGreaterThan(0)
    })

    it('should render welcome message', async () => {
      await renderLoginPage()

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    })

    it('should not display demo credentials', async () => {
      await renderLoginPage()

      expect(screen.queryByText(/demo credentials/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/admin@recoversystem.com/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/SuperAdmin123!/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require email field', async () => {
      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('should require password field', async () => {
      await renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('required')
    })

    it('should validate email format', async () => {
      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should hide password by default', async () => {
      await renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should toggle password visibility when clicking the eye icon', async () => {
      await renderLoginPage()

      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = passwordInput.parentElement?.querySelector('button')

      expect(toggleButton).toBeInTheDocument()

      // Initially hidden
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click to show
      fireEvent.click(toggleButton!)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click to hide again
      fireEvent.click(toggleButton!)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Submission', () => {
    it('should call staffLogin on form submission', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'counselor',
        },
        accessToken: 'token',
        refreshToken: 'refresh',
      }
      vi.mocked(api.authAPI.staffLogin).mockResolvedValue(mockResponse)

      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(api.authAPI.staffLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should show loading state during submission', async () => {
      vi.mocked(api.authAPI.staffLogin).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)
      })

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled()
    })

    it('should display error message on failed login', async () => {
      vi.mocked(api.authAPI.staffLogin).mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Invalid credentials' },
        },
      })

      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })
  })

  describe('Server Status', () => {
    it('should show offline warning when server is unavailable', async () => {
      vi.mocked(api.healthCheck).mockResolvedValue({ status: 'error' })

      await renderLoginPage()

      await waitFor(() => {
        expect(screen.getByText(/server unavailable/i)).toBeInTheDocument()
      })
    })

    it('should not show offline warning when server is healthy', async () => {
      vi.mocked(api.healthCheck).mockResolvedValue({ status: 'healthy' })

      await renderLoginPage()

      await waitFor(() => {
        expect(screen.queryByText(/server unavailable/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Security', () => {
    it('should NOT allow mock login when server is offline', async () => {
      vi.mocked(api.healthCheck).mockResolvedValue({ status: 'error' })
      vi.mocked(api.authAPI.staffLogin).mockRejectedValue({
        code: 'ERR_NETWORK',
      })

      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Try demo credentials - should NOT work
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'admin@recoversystem.com' } })
        fireEvent.change(passwordInput, { target: { value: 'SuperAdmin123!' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        // Should show connection error, not login success
        expect(screen.getByText(/unable to connect to server/i)).toBeInTheDocument()
      })

      // User should NOT be authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should update auth store on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      vi.mocked(api.authAPI.staffLogin).mockResolvedValue({
        success: true,
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })

      await renderLoginPage()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true)
        expect(useAuthStore.getState().user).toEqual(mockUser)
        expect(useAuthStore.getState().accessToken).toBe('access-token')
      })
    })
  })
})
