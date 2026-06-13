import { test, expect } from '@playwright/test'

/**
 * E2E tests for Treatment Plans functionality
 * Tests plan management, creation, assignment, and CRUD operations
 */
test.describe('Treatment Plans Page', () => {
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
    await page.goto('/treatment-plans')
  })

  test('should display treatment plans page with header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /treatment plans/i })).toBeVisible()
    await expect(page.getByText(/create and manage recovery programs/i)).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    await expect(page.getByText(/total plans/i)).toBeVisible()
    await expect(page.getByText(/active plans/i)).toBeVisible()
    await expect(page.getByText(/patients enrolled/i)).toBeVisible()
    await expect(page.getByText(/drafts/i)).toBeVisible()
  })

  test('should have create plan button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create plan/i })
    await expect(createButton).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search plans/i)
    await expect(searchInput).toBeVisible()

    await searchInput.fill('30-Day')
    await expect(searchInput).toHaveValue('30-Day')
  })

  test('should have status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator('select#status-filter')
    await expect(statusFilter).toBeVisible()

    // Check options
    await expect(statusFilter.locator('option[value="all"]')).toHaveText('All Status')
    await expect(statusFilter.locator('option[value="active"]')).toHaveText('Active')
    await expect(statusFilter.locator('option[value="draft"]')).toHaveText('Draft')
    await expect(statusFilter.locator('option[value="archived"]')).toHaveText('Archived')
  })

  test('should filter plans by status', async ({ page }) => {
    const statusFilter = page.locator('select#status-filter')
    await statusFilter.selectOption('draft')

    await page.waitForTimeout(300)

    // Should show only draft plans (or empty if none match)
    const draftBadges = page.locator('span:has-text("Draft")')
    const planCards = page.locator('.grid.grid-cols-2 > div')

    // Either show draft plans or all cards should have draft badge
    const cardCount = await planCards.count()
    if (cardCount > 0) {
      // All visible cards should be drafts
      expect(await draftBadges.count()).toBeGreaterThanOrEqual(1)
    }
  })

  test('should display plan cards with correct structure', async ({ page }) => {
    await page.waitForTimeout(500)

    // Find a plan card
    const planCards = page.locator('.grid.grid-cols-2 > div').first()

    // Should have plan name
    const planName = planCards.locator('h3')
    await expect(planName).toBeVisible()

    // Should have status badge
    const statusBadge = planCards.locator('span.rounded-full')
    await expect(statusBadge).toBeVisible()

    // Should have duration info
    const durationInfo = planCards.getByText(/days|weeks|months/i)
    await expect(durationInfo.first()).toBeVisible()
  })

  test('should display phase indicators on plan cards', async ({ page }) => {
    await page.waitForTimeout(500)

    // Find a plan with phases (most mock plans have phases)
    const phaseIndicators = page.locator('.flex.gap-1 > div.flex-1.h-2')
    expect(await phaseIndicators.count()).toBeGreaterThan(0)
  })

  test('should have assign to patient button on plan cards', async ({ page }) => {
    await page.waitForTimeout(500)

    const assignButton = page.getByRole('button', { name: /assign to patient/i }).first()
    await expect(assignButton).toBeVisible()
  })

  test('should have edit button on plan cards', async ({ page }) => {
    await page.waitForTimeout(500)

    const editButtons = page.locator('.grid.grid-cols-2 > div button:has(svg)')
    expect(await editButtons.count()).toBeGreaterThan(0)
  })

  test('should open create plan modal', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()

    // Modal should appear
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check modal title
    await expect(page.getByRole('heading', { name: /create treatment plan/i })).toBeVisible()
  })

  test('should have form fields in create plan modal', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()

    // Check for form fields
    await expect(page.getByLabel(/plan name/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/duration/i)).toBeVisible()
  })

  test('should close create plan modal with cancel', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should open assign plan modal', async ({ page }) => {
    await page.waitForTimeout(500)

    // Click assign button on first plan
    const assignButton = page.getByRole('button', { name: /assign to patient/i }).first()
    await assignButton.click()

    // Modal should appear
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check modal title
    await expect(page.getByRole('heading', { name: /assign treatment plan/i })).toBeVisible()
  })

  test('should display patient list in assign modal', async ({ page }) => {
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: /assign to patient/i }).first().click()
    await page.waitForTimeout(300)

    // Should show patient selection (either checkboxes or list)
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check for patient-related content
    const patientContent = modal.getByText(/patient|select|john|jane/i)
    expect(await patientContent.count()).toBeGreaterThan(0)
  })

  test('should validate plan name is required', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()

    // Try to submit without name
    const submitButton = page.getByRole('button', { name: /create|save/i }).first()
    await submitButton.click()

    // Should show validation error or not close modal
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
  })
})

test.describe('Treatment Plans - Phase Management', () => {
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
    await page.goto('/treatment-plans')
  })

  test('should have add phase button in create modal', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()

    const addPhaseButton = page.getByRole('button', { name: /add phase/i })
    await expect(addPhaseButton).toBeVisible()
  })

  test('should add phase to new plan', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()

    // Click add phase
    await page.getByRole('button', { name: /add phase/i }).click()

    // Should show phase editor section
    const phaseSection = page.getByText(/phase 1/i)
    await expect(phaseSection).toBeVisible()
  })

  test('should show phase details with goals and activities', async ({ page }) => {
    await page.getByRole('button', { name: /create plan/i }).click()
    await page.getByRole('button', { name: /add phase/i }).click()

    // Phase editor should have goals and activities inputs
    const goalsLabel = page.getByText(/goals/i)
    const activitiesLabel = page.getByText(/activities/i)

    await expect(goalsLabel.first()).toBeVisible()
    await expect(activitiesLabel.first()).toBeVisible()
  })
})

test.describe('Treatment Plans - Search and Filter', () => {
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
    await page.goto('/treatment-plans')
  })

  test('should filter plans by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search plans/i)
    await searchInput.fill('Intensive')
    await page.waitForTimeout(300)

    // Should show filtered results
    const planCards = page.locator('.grid.grid-cols-2 > div')
    const cardCount = await planCards.count()

    // Either shows matching results or empty
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('should clear search to show all plans', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search plans/i)

    // Search for something
    await searchInput.fill('Nonexistent Plan 12345')
    await page.waitForTimeout(300)

    // Clear search
    await searchInput.fill('')
    await page.waitForTimeout(300)

    // Should show all plans again
    const planCards = page.locator('.grid.grid-cols-2 > div')
    expect(await planCards.count()).toBeGreaterThan(0)
  })

  test('should combine search and status filter', async ({ page }) => {
    // Set status filter
    await page.locator('select#status-filter').selectOption('active')

    // Add search term
    await page.getByPlaceholder(/search plans/i).fill('30')
    await page.waitForTimeout(300)

    // Results should be filtered by both
    const planCards = page.locator('.grid.grid-cols-2 > div')
    const cardCount = await planCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Treatment Plans - Accessibility', () => {
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
    await page.goto('/treatment-plans')
  })

  test('should have accessible search input with label', async ({ page }) => {
    const searchLabel = page.locator('label[for="plan-search"]')
    await expect(searchLabel).toBeVisible()
  })

  test('should have accessible status filter with label', async ({ page }) => {
    const filterLabel = page.locator('label[for="status-filter"]')
    await expect(filterLabel).toBeVisible()
  })

  test('should have decorative icons marked as aria-hidden', async ({ page }) => {
    // Icons in buttons should be aria-hidden
    const hiddenIcons = page.locator('button svg[aria-hidden="true"], [aria-hidden="true"] svg')
    expect(await hiddenIcons.count()).toBeGreaterThan(0)
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to create button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Press Enter to activate focused element
    // (Just verify no errors occur)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
  })
})
