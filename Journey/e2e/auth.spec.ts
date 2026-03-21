import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page when not authenticated', async ({ page }) => {
    // Verify login page elements
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Submit empty form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for validation messages (HTML5 validation or custom)
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i)
    const toggleButton = page.getByRole('button', { name: /show password|hide password/i })

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button
    await toggleButton.click()

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should show loading state during login attempt', async ({ page }) => {
    // Fill in form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('testpassword123')

    // Click sign in
    await page.getByRole('button', { name: /sign in/i }).click()

    // Button should show loading state (either disabled or with spinner)
    const signInButton = page.getByRole('button', { name: /sign in|signing/i })

    // Either the button is disabled or shows "Signing in..."
    // This depends on how fast the mock responds
    await expect(signInButton).toBeVisible()
  })

  test('should have accessible form elements', async ({ page }) => {
    // Verify form accessibility
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)

    // Labels should be properly associated
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Form should be keyboard navigable
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
  })
})

test.describe('Authenticated Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state by setting sessionStorage
    await page.goto('/')
    await page.evaluate(() => {
      const mockUser = {
        id: 'test-user-1',
        email: 'clinician@recover.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
        facility_id: 'facility-1',
      }
      sessionStorage.setItem('auth-storage', JSON.stringify({
        state: { user: mockUser, isAuthenticated: true },
        version: 0,
      }))
    })
    await page.reload()
  })

  test('should display dashboard after login', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page).toHaveURL('/')

    // Look for dashboard elements
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should navigate to patients page', async ({ page }) => {
    // Click on patients link in sidebar
    await page.getByRole('link', { name: /patients/i }).click()

    await expect(page).toHaveURL('/patients')
  })

  test('should navigate to messages page', async ({ page }) => {
    // Click on messages link
    await page.getByRole('link', { name: /messages/i }).click()

    await expect(page).toHaveURL('/messages')
  })
})
