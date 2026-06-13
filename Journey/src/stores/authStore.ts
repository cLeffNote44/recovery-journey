import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { setUser as setMonitoringUser } from '../services/monitoring'
import { auditLog } from '../services/auditLog'
import { queryClient } from '../lib/queryClient'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  facility_id?: string
}

interface AuthState {
  // Persisted (non-sensitive)
  user: User | null
  // NOT persisted (sensitive - kept in memory only)
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  tokenExpiresAt: number | null
  // Actions
  login: (user: User, accessToken: string, refreshToken: string, expiresIn?: number) => void
  logout: (reason?: 'manual' | 'session_timeout' | 'forced') => void
  updateTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => void
  isTokenExpired: () => boolean
  clearSession: () => void
}

// Default token expiry: 1 hour (in milliseconds)
const DEFAULT_TOKEN_EXPIRY_MS = 60 * 60 * 1000

// Helper to calculate expiry timestamp
const calculateExpiry = (expiresIn?: number): number => {
  const expiryMs = expiresIn ? expiresIn * 1000 : DEFAULT_TOKEN_EXPIRY_MS
  return Date.now() + expiryMs
}

// Secure storage that uses sessionStorage (cleared on browser close)
// and excludes sensitive token data from persistence
const secureStorage = createJSONStorage(() => sessionStorage)

// E2E escape hatch: Playwright seeds a persisted user (no tokens) and needs
// authenticated pages to render against mock data. Only honored under the
// Vite dev server with VITE_E2E=true (set by playwright.config.ts), so this
// branch is dead code in production builds where the forced re-login below
// remains the HIPAA-required behavior.
const isE2E = import.meta.env.DEV && import.meta.env.VITE_E2E === 'true'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,

      login: (user, accessToken, refreshToken, expiresIn) => {
        set({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          tokenExpiresAt: calculateExpiry(expiresIn),
        })
        // Set monitoring user context for error tracking
        setMonitoringUser({ id: user.id, email: user.email, role: user.role })
        // Set audit log user context and log successful login
        auditLog.setUserContext({
          id: user.id,
          email: user.email,
          role: user.role,
          facilityId: user.facility_id,
        })
        auditLog.loginSuccess(user.id)
      },

      logout: (reason: 'manual' | 'session_timeout' | 'forced' = 'manual') => {
        // Log the logout event before clearing context
        auditLog.logout(reason)
        // Clear all auth state
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        })
        // Clear monitoring user context
        setMonitoringUser(null)
        // Clear audit log user context
        auditLog.clearUserContext()
        // Purge cached PHI so the next user on this workstation can't see
        // the previous session's patients, messages, or dashboards
        queryClient.clear()
        // Also clear any remaining storage
        try {
          sessionStorage.removeItem('auth-storage')
          localStorage.removeItem('auth-storage') // Clean up old localStorage if exists
        } catch {
          // Ignore storage errors
        }
      },

      updateTokens: (accessToken, refreshToken, expiresIn) => {
        set({
          accessToken,
          refreshToken,
          tokenExpiresAt: calculateExpiry(expiresIn),
        })
      },

      isTokenExpired: () => {
        const { tokenExpiresAt, accessToken } = get()
        if (!accessToken || !tokenExpiresAt) return true
        // Add 30 second buffer to prevent edge cases
        return Date.now() >= tokenExpiresAt - 30000
      },

      clearSession: () => {
        // Clear only the session-related data, keep user for UX
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: secureStorage,
      // IMPORTANT: Only persist non-sensitive data
      // Tokens are kept in memory only and will be cleared on page refresh
      partialize: (state) => ({
        // Only persist user info for UX (showing "Welcome back, [name]")
        // Do NOT persist tokens - they stay in memory only
        user: state.user,
      }),
      // On rehydration, ensure we're not authenticated
      // User must re-login after browser close
      onRehydrateStorage: () => (state) => {
        if (state) {
          // E2E only: trust the seeded user so pages render without a login
          // round-trip. Tokens stay null, so all API calls fall back to mock.
          if (isE2E && state.user) {
            state.isAuthenticated = true
            return
          }
          // After rehydration, tokens are null (not persisted)
          // So user must re-authenticate
          state.isAuthenticated = false
          state.accessToken = null
          state.refreshToken = null
          state.tokenExpiresAt = null
        }
      },
    }
  )
)

// Helper hook to check if user needs to re-authenticate
export const useNeedsReauth = () => {
  const { isAuthenticated, isTokenExpired } = useAuthStore()
  return !isAuthenticated || isTokenExpired()
}
