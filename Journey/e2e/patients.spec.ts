import { test, expect } from '@playwright/test'

test.describe('Patients Page', () => {
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
      sessionStorage.setItem('auth-storage', JSON.stringify({
        state: { user: mockUser, isAuthenticated: true },
        version: 0,
      }))
    })
    await page.goto('/patients')
  })

  test('should display patients list', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /patients/i })).toBeVisible()

    // Should show the patients table or list
    await expect(page.locator('table, [role="grid"]')).toBeVisible({ timeout: 10000 })
  })

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('John')

    // The search should be debounced, wait a bit
    await page.waitForTimeout(400)

    // Verify the search input has the value
    await expect(searchInput).toHaveValue('John')
  })

  test('should have new patient button', async ({ page }) => {
    // Find new patient button
    const newPatientButton = page.getByRole('button', { name: /new patient|add patient/i })
    await expect(newPatientButton).toBeVisible()
  })

  test('should open new patient modal', async ({ page }) => {
    // Click new patient button
    const newPatientButton = page.getByRole('button', { name: /new patient|add patient/i })
    await newPatientButton.click()

    // Modal should appear
    await expect(page.getByRole('dialog')).toBeVisible()

    // Modal should have form fields
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
  })

  test('should validate new patient form', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /new patient|add patient/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /create|save|add/i }).first()
    await submitButton.click()

    // Should show validation errors or required field highlights
    const firstNameInput = page.getByLabel(/first name/i)
    // Either has validation message or required attribute
    const hasRequired = await firstNameInput.getAttribute('required')
    const hasAriaInvalid = await firstNameInput.getAttribute('aria-invalid')

    expect(hasRequired !== null || hasAriaInvalid === 'true').toBeTruthy()
  })

  test('should close modal on cancel', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /new patient|add patient/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Click cancel or close button
    const cancelButton = page.getByRole('button', { name: /cancel|close/i })
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
    } else {
      // Try clicking X button
      await page.getByRole('button', { name: /×|close/i }).click()
    }

    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should display patient status filters', async ({ page }) => {
    // Look for filter/status options
    const filterDropdown = page.locator('select, [role="listbox"], button:has-text("All"), button:has-text("Active")')
    await expect(filterDropdown.first()).toBeVisible()
  })
})

test.describe('Patient Detail Page', () => {
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
      sessionStorage.setItem('auth-storage', JSON.stringify({
        state: { user: mockUser, isAuthenticated: true },
        version: 0,
      }))
    })
  })

  test('should display patient detail view', async ({ page }) => {
    // Navigate to a patient detail page
    await page.goto('/patients/patient-1')

    // Should show patient information
    // Wait for the page to load (either real data or mock)
    await page.waitForTimeout(1000)

    // Should have navigation back or breadcrumb
    const backLink = page.locator('a:has-text("Patients"), a:has-text("Back"), button:has-text("Back")')
    await expect(backLink.first()).toBeVisible()
  })

  test('should have tabs for different sections', async ({ page }) => {
    await page.goto('/patients/patient-1')

    // Wait for content to load
    await page.waitForTimeout(1000)

    // Look for tab navigation
    const tabs = page.locator('[role="tab"], button:has-text("Overview"), button:has-text("Timeline")')
    await expect(tabs.first()).toBeVisible()
  })
})
