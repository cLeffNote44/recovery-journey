/**
 * Regression tests for the E2E auth rehydration bypass (see authStore.ts).
 *
 * Playwright seeds a persisted user in sessionStorage and needs authenticated
 * pages to render without a live backend. That only works when VITE_E2E=true
 * under the dev server; in every other environment rehydration must force a
 * re-login (HIPAA: tokens live in memory only).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const seedPersistedUser = () =>
  sessionStorage.setItem(
    'auth-storage',
    JSON.stringify({
      state: {
        user: {
          id: 'test-user-1',
          email: 'clinician@recover.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'counselor',
          facility_id: 'facility-1',
        },
        isAuthenticated: true,
      },
      version: 0,
    })
  )

describe('authStore E2E rehydration bypass', () => {
  beforeEach(() => {
    vi.resetModules()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('keeps the seeded user authenticated when VITE_E2E=true (dev server)', async () => {
    vi.stubEnv('VITE_E2E', 'true')
    seedPersistedUser()

    const { useAuthStore } = await import('./authStore')
    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('clinician@recover.com')
    // The bypass must never conjure tokens — API calls still have no auth.
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  it('does not authenticate without a seeded user even when VITE_E2E=true', async () => {
    vi.stubEnv('VITE_E2E', 'true')

    const { useAuthStore } = await import('./authStore')

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('forces re-login on rehydration when VITE_E2E is not set', async () => {
    seedPersistedUser()

    const { useAuthStore } = await import('./authStore')
    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    // The user is kept for the "welcome back" UX, but not authenticated.
    expect(state.user?.email).toBe('clinician@recover.com')
  })
})
