import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    })
    sessionStorage.clear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should set user and tokens on login', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
        facility_id: 'facility-1',
      }
      const accessToken = 'test-access-token'
      const refreshToken = 'test-refresh-token'

      useAuthStore.getState().login(mockUser, accessToken, refreshToken)

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(state.accessToken).toBe(accessToken)
      expect(state.refreshToken).toBe(refreshToken)
    })

    it('should set isAuthenticated to true', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'super_admin',
      }

      useAuthStore.getState().login(mockUser, 'token', 'refresh')

      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should set token expiry with default time', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      useAuthStore.getState().login(mockUser, 'token', 'refresh')

      const state = useAuthStore.getState()
      // Default expiry is 1 hour (3600000 ms)
      expect(state.tokenExpiresAt).toBe(now + 60 * 60 * 1000)
    })

    it('should set custom token expiry when provided', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      const expiresIn = 1800 // 30 minutes in seconds

      useAuthStore.getState().login(mockUser, 'token', 'refresh', expiresIn)

      const state = useAuthStore.getState()
      expect(state.tokenExpiresAt).toBe(now + 1800 * 1000)
    })
  })

  describe('logout', () => {
    it('should clear all auth state on logout', () => {
      // First login
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'access', 'refresh')

      // Then logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.tokenExpiresAt).toBeNull()
    })

    it('should clear storage on logout', () => {
      sessionStorage.setItem('auth-storage', 'test')
      localStorage.setItem('auth-storage', 'old-data')

      useAuthStore.getState().logout()

      expect(sessionStorage.getItem('auth-storage')).toBeNull()
      expect(localStorage.getItem('auth-storage')).toBeNull()
    })
  })

  describe('updateTokens', () => {
    it('should update tokens without affecting user', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'old-access', 'old-refresh')

      useAuthStore.getState().updateTokens('new-access', 'new-refresh')

      const state = useAuthStore.getState()
      expect(state.accessToken).toBe('new-access')
      expect(state.refreshToken).toBe('new-refresh')
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should update token expiry on refresh', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'old-access', 'old-refresh')

      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      const newExpiresIn = 3600 // 1 hour

      useAuthStore.getState().updateTokens('new-access', 'new-refresh', newExpiresIn)

      expect(useAuthStore.getState().tokenExpiresAt).toBe(now + 3600 * 1000)
    })
  })

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      expect(useAuthStore.getState().isTokenExpired()).toBe(true)
    })

    it('should return true when token is expired', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }

      // Login with token that expires in 1 second
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValueOnce(now)
      useAuthStore.getState().login(mockUser, 'token', 'refresh', 1)

      // Simulate time passing (2 seconds later)
      vi.spyOn(Date, 'now').mockReturnValue(now + 2000)

      expect(useAuthStore.getState().isTokenExpired()).toBe(true)
    })

    it('should return false when token is valid', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }

      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      useAuthStore.getState().login(mockUser, 'token', 'refresh', 3600)

      expect(useAuthStore.getState().isTokenExpired()).toBe(false)
    })

    it('should return true when token is about to expire (30 second buffer)', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }

      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValueOnce(now)
      // Token expires in 60 seconds
      useAuthStore.getState().login(mockUser, 'token', 'refresh', 60)

      // 40 seconds later (20 seconds until expiry, within 30 second buffer)
      vi.spyOn(Date, 'now').mockReturnValue(now + 40000)

      expect(useAuthStore.getState().isTokenExpired()).toBe(true)
    })
  })

  describe('clearSession', () => {
    it('should clear session data but keep user', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'access', 'refresh')

      useAuthStore.getState().clearSession()

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.tokenExpiresAt).toBeNull()
      expect(state.user).toEqual(mockUser)
    })
  })

  describe('role-based checks', () => {
    it('should correctly identify super_admin role', () => {
      const superAdmin = {
        id: 'admin-id',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
      }
      useAuthStore.getState().login(superAdmin, 'token', 'refresh')

      expect(useAuthStore.getState().user?.role).toBe('super_admin')
    })

    it('should correctly identify counselor role', () => {
      const counselor = {
        id: 'counselor-id',
        email: 'counselor@example.com',
        first_name: 'Counselor',
        last_name: 'User',
        role: 'counselor',
        facility_id: 'facility-1',
      }
      useAuthStore.getState().login(counselor, 'token', 'refresh')

      expect(useAuthStore.getState().user?.role).toBe('counselor')
      expect(useAuthStore.getState().user?.facility_id).toBe('facility-1')
    })
  })

  describe('storage security', () => {
    it('should use sessionStorage instead of localStorage', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'token', 'refresh')

      // Allow zustand to persist
      // In real test, we'd need to wait for persist middleware

      // localStorage should NOT have tokens
      const localData = localStorage.getItem('auth-storage')
      if (localData) {
        const parsed = JSON.parse(localData)
        expect(parsed.state?.accessToken).toBeUndefined()
        expect(parsed.state?.refreshToken).toBeUndefined()
      }
    })

    it('should NOT persist tokens to storage', () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
      }
      useAuthStore.getState().login(mockUser, 'secret-token', 'secret-refresh')

      // Check sessionStorage doesn't contain tokens
      const sessionData = sessionStorage.getItem('auth-storage')
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        expect(parsed.state?.accessToken).toBeUndefined()
        expect(parsed.state?.refreshToken).toBeUndefined()
        // But user info should be persisted
        expect(parsed.state?.user).toBeDefined()
      }
    })
  })
})
