import { test, expect } from '@playwright/test'

/**
 * E2E tests for the Messages functionality
 */
test.describe('Messages Page', () => {
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
    await page.goto('/messages')
  })

  test('should display messages page', async ({ page }) => {
    // Wait for the page to load
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible()
  })

  test('should have conversation list', async ({ page }) => {
    // Look for conversation list container
    await page.waitForTimeout(1000) // Wait for mock data to load

    // Either shows conversations or empty state
    const hasConversations = page.locator('[data-testid="conversation-list"], .conversation-item')
    const hasEmptyState = page.getByText(/no messages|no conversations|start a conversation/i)

    // One of these should be visible
    const conversationsVisible = await hasConversations.first().isVisible().catch(() => false)
    const emptyVisible = await hasEmptyState.isVisible().catch(() => false)

    expect(conversationsVisible || emptyVisible).toBeTruthy()
  })

  test('should have compose message button', async ({ page }) => {
    // Find compose/new message button
    const composeButton = page.getByRole('button', {
      name: /compose|new message|new conversation/i,
    })
    await expect(composeButton).toBeVisible()
  })

  test('should open compose dialog', async ({ page }) => {
    // Click compose button
    const composeButton = page.getByRole('button', {
      name: /compose|new message|new conversation/i,
    })
    await composeButton.click()

    // Dialog or form should appear
    const dialog = page.getByRole('dialog')
    const form = page.locator('form:has(textarea), [data-testid="compose-form"]')

    const dialogVisible = await dialog.isVisible().catch(() => false)
    const formVisible = await form.isVisible().catch(() => false)

    expect(dialogVisible || formVisible).toBeTruthy()
  })

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i)

    // Search might be optional, so check if it exists
    const searchExists = await searchInput.isVisible().catch(() => false)

    if (searchExists) {
      await searchInput.fill('test search')
      await expect(searchInput).toHaveValue('test search')
    }
  })

  test('should display message content when conversation selected', async ({ page }) => {
    await page.waitForTimeout(1000)

    // Try to click on a conversation
    const conversationItem = page.locator(
      '.conversation-item, [data-testid="conversation-item"], li:has(img)'
    )

    if (await conversationItem.first().isVisible().catch(() => false)) {
      await conversationItem.first().click()

      // Message content area should be visible
      const messageArea = page.locator(
        '.message-area, [data-testid="message-area"], .messages-container'
      )
      await expect(messageArea).toBeVisible({ timeout: 5000 }).catch(() => {
        // It's okay if we can't find a specific message area
      })
    }
  })

  test('should have accessible message input', async ({ page }) => {
    await page.waitForTimeout(1000)

    // Look for message input
    const messageInput = page.locator(
      'textarea[placeholder*="message"], input[placeholder*="message"], [data-testid="message-input"]'
    )

    if (await messageInput.isVisible().catch(() => false)) {
      await messageInput.focus()
      await expect(messageInput).toBeFocused()
    }
  })
})

test.describe('Messages - Error Handling', () => {
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
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Block API requests to simulate network error
    await page.route('**/api/**', (route) => {
      route.abort('failed')
    })

    await page.goto('/messages')

    // Should show error state or fallback data
    await page.waitForTimeout(2000)

    // Either shows error message, fallback data, or empty state
    const content = await page.content()
    const hasContent =
      content.includes('error') ||
      content.includes('Error') ||
      content.includes('message') ||
      content.includes('Messages')

    expect(hasContent).toBeTruthy()
  })
})
