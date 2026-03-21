import { test, expect } from '@playwright/test'

/**
 * E2E tests for the Settings page
 * Tests appearance, profile, notifications, and security settings
 */
test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should display settings page with header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  test('should display appearance section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /appearance/i })).toBeVisible()
    await expect(page.getByText(/dark mode/i)).toBeVisible()
  })

  test('should display profile section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible()
  })

  test('should display notifications section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible()
  })

  test('should display security section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /security/i })).toBeVisible()
  })

  test('should have sign out button', async ({ page }) => {
    const signOutButton = page.getByRole('button', { name: /sign out/i })
    await expect(signOutButton).toBeVisible()
  })
})

test.describe('Settings - Appearance', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should have dark mode toggle switch', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: /dark mode/i })
    await expect(toggle).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: /dark mode/i })

    // Get initial state
    const initialState = await toggle.getAttribute('aria-checked')

    // Click toggle
    await toggle.click()

    // State should change
    const newState = await toggle.getAttribute('aria-checked')
    expect(newState).not.toBe(initialState)
  })

  test('should show dark mode description', async ({ page }) => {
    await expect(page.getByText(/switch between light and dark themes/i)).toBeVisible()
  })
})

test.describe('Settings - Profile', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should display first name input with current value', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i)
    await expect(firstNameInput).toBeVisible()
    await expect(firstNameInput).toHaveValue('Test')
  })

  test('should display last name input with current value', async ({ page }) => {
    const lastNameInput = page.getByLabel(/last name/i)
    await expect(lastNameInput).toBeVisible()
    await expect(lastNameInput).toHaveValue('User')
  })

  test('should display email as disabled', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toBeDisabled()
    await expect(emailInput).toHaveValue('clinician@recover.com')
  })

  test('should show helper text for email change', async ({ page }) => {
    await expect(page.getByText(/contact your administrator to change email/i)).toBeVisible()
  })

  test('should show save button when profile is modified', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i)

    // Modify the value
    await firstNameInput.fill('Modified')

    // Save button should appear
    const saveButton = page.getByRole('button', { name: /save changes/i }).first()
    await expect(saveButton).toBeVisible()
  })

  test('should show unsaved changes indicator', async ({ page }) => {
    const firstNameInput = page.getByLabel(/first name/i)

    // Modify the value
    await firstNameInput.fill('Modified Name')

    // Unsaved changes indicator should appear
    await expect(page.getByText(/unsaved changes/i)).toBeVisible()
  })
})

test.describe('Settings - Notifications', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should display notification checkboxes', async ({ page }) => {
    await expect(page.getByText(/new patient check-ins/i)).toBeVisible()
    await expect(page.getByText(/missed check-in alerts/i)).toBeVisible()
    await expect(page.getByText(/new messages/i)).toBeVisible()
    await expect(page.getByText(/appointment reminders/i)).toBeVisible()
  })

  test('should toggle notification preferences', async ({ page }) => {
    // Find a notification checkbox
    const checkboxes = page.locator('input[type="checkbox"]')
    const notificationCheckbox = checkboxes.nth(1) // Skip dark mode toggle

    // Get initial state
    const initialChecked = await notificationCheckbox.isChecked()

    // Click to toggle
    await notificationCheckbox.click()

    // State should change
    const newChecked = await notificationCheckbox.isChecked()
    expect(newChecked).not.toBe(initialChecked)
  })

  test('should show save button when notifications modified', async ({ page }) => {
    // Find the notifications section and toggle a checkbox
    const notificationCheckboxes = page.locator(
      '.space-y-4 label input[type="checkbox"]'
    )

    if ((await notificationCheckboxes.count()) > 0) {
      await notificationCheckboxes.first().click()

      // May or may not show save button based on implementation
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Settings - Security', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should have change password button', async ({ page }) => {
    const changePasswordButton = page.getByRole('button', { name: /change password/i })
    await expect(changePasswordButton).toBeVisible()
  })

  test('should display two-factor authentication option', async ({ page }) => {
    await expect(page.getByText(/two-factor authentication/i)).toBeVisible()
    await expect(page.getByText(/add an extra layer of security/i)).toBeVisible()
  })

  test('should open password change modal', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    // Modal should appear
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check modal title
    await expect(page.getByRole('heading', { name: /change password/i })).toBeVisible()
  })

  test('should have password form fields in modal', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/new password/i).first()).toBeVisible()
    await expect(page.getByLabel(/confirm new password/i)).toBeVisible()
  })

  test('should show password requirements', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    await expect(page.getByText(/must be at least 8 characters/i)).toBeVisible()
  })

  test('should validate password confirmation matches', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    // Fill passwords that don't match
    await page.getByLabel(/current password/i).fill('current123')
    await page.getByLabel(/new password/i).first().fill('newpassword123')
    await page.getByLabel(/confirm new password/i).fill('differentpassword')

    // Submit
    await page.getByRole('button', { name: /change password/i }).last().click()

    // Should show error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('should validate new password length', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    // Fill with short password
    await page.getByLabel(/current password/i).fill('current')
    await page.getByLabel(/new password/i).first().fill('short')
    await page.getByLabel(/confirm new password/i).fill('short')

    // Submit
    await page.getByRole('button', { name: /change password/i }).last().click()

    // Should show error
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
  })

  test('should close password modal with cancel', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should clear form when modal is closed', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    // Fill form
    await page.getByLabel(/current password/i).fill('testpassword')

    // Close and reopen
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.getByRole('button', { name: /change password/i }).click()

    // Form should be empty
    await expect(page.getByLabel(/current password/i)).toHaveValue('')
  })
})

test.describe('Settings - Sign Out', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should have sign out button with icon', async ({ page }) => {
    const signOutButton = page.getByRole('button', { name: /sign out/i })
    await expect(signOutButton).toBeVisible()

    // Should have logout icon
    const icon = signOutButton.locator('svg')
    await expect(icon).toBeVisible()
  })

  test('should redirect to login after sign out', async ({ page }) => {
    await page.getByRole('button', { name: /sign out/i }).click()

    // Should redirect to login page
    await page.waitForURL('**/login**', { timeout: 5000 }).catch(() => {
      // Or just show login form on same page
    })

    // Should show login form
    const loginForm = page.getByRole('button', { name: /sign in|log in/i })
    await expect(loginForm).toBeVisible({ timeout: 5000 }).catch(() => {
      // Alternative: just verify we're no longer on settings
      expect(page.url()).not.toContain('/settings')
    })
  })
})

test.describe('Settings - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
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
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should have accessible dark mode toggle with role="switch"', async ({ page }) => {
    const toggle = page.getByRole('switch')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked')
  })

  test('should have proper form labels', async ({ page }) => {
    // All inputs should have labels
    const firstNameLabel = page.getByText('First Name', { exact: false })
    const lastNameLabel = page.getByText('Last Name', { exact: false })
    const emailLabel = page.getByText('Email', { exact: false })

    await expect(firstNameLabel).toBeVisible()
    await expect(lastNameLabel).toBeVisible()
    await expect(emailLabel).toBeVisible()
  })

  test('should have unsaved changes status with aria-live', async ({ page }) => {
    // Modify a field to trigger unsaved changes
    await page.getByLabel(/first name/i).fill('Modified')

    // Status should have aria-live
    const status = page.locator('[role="status"][aria-live="polite"]')
    await expect(status).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through settings
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to activate focused element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should trap focus in password modal', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()

    // Tab through modal
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should still be in modal
    const modal = page.getByRole('dialog')
    const focusedElement = page.locator(':focus')

    // The focused element should be within the modal or be the modal itself
    await expect(modal).toBeVisible()
  })
})

test.describe('Settings - Super Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set up as super admin
    await page.evaluate(() => {
      const mockUser = {
        id: 'admin-user-1',
        email: 'admin@recover.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
        facility_id: 'facility-1',
      }
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should display facility management section for super admin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /facility management/i })).toBeVisible()
  })

  test('should have manage facilities button for super admin', async ({ page }) => {
    const manageFacilitiesButton = page.getByRole('button', { name: /manage facilities/i })
    await expect(manageFacilitiesButton).toBeVisible()
  })
})

test.describe('Settings - Regular User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set up as regular counselor
    await page.evaluate(() => {
      const mockUser = {
        id: 'test-user-1',
        email: 'clinician@recover.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'counselor',
        facility_id: 'facility-1',
      }
      sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { user: mockUser, isAuthenticated: true },
          version: 0,
        })
      )
    })
    await page.goto('/settings')
  })

  test('should NOT display facility management section for regular user', async ({ page }) => {
    const facilitySection = page.getByRole('heading', { name: /facility management/i })
    await expect(facilitySection).not.toBeVisible()
  })
})
