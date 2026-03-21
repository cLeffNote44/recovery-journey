import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('text=Days Sober')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Home tab (default)
    await expect(page).toHaveURL('/app');
    await expect(page.locator('text=Days Sober')).toBeVisible();

    // Navigate to Journal
    await page.click('button[aria-label="Journal"]');
    await expect(page).toHaveURL('/app?tab=journal');
    await expect(page.locator('text=Journal Entries')).toBeVisible();

    // Navigate to Analytics
    await page.click('button[aria-label="Analytics"]');
    await expect(page).toHaveURL('/app?tab=analytics');
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Navigate to Calendar
    await page.click('button[aria-label="Calendar"]');
    await expect(page).toHaveURL('/app?tab=calendar');
    await expect(page.locator('text=Calendar')).toBeVisible();

    // Navigate to Settings
    await page.click('button[aria-label="Settings"]');
    await expect(page).toHaveURL('/app?tab=settings');
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should use keyboard shortcuts', async ({ page }) => {
    // Ctrl+H for Home
    await page.keyboard.press('Control+h');
    await expect(page).toHaveURL('/app');

    // Ctrl+J for Journal
    await page.keyboard.press('Control+j');
    await expect(page).toHaveURL('/app?tab=journal');

    // Ctrl+A for Analytics
    await page.keyboard.press('Control+a');
    await expect(page).toHaveURL('/app?tab=analytics');

    // Ctrl+K for Shortcuts Help
    await page.keyboard.press('Control+k');
    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();

    // Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Keyboard Shortcuts')).not.toBeVisible();
  });

  test('should show emergency support', async ({ page }) => {
    // Click emergency button
    await page.click('button:has-text("Emergency")');

    // Should show emergency contacts
    await expect(page.locator('text=Emergency Support')).toBeVisible();
    await expect(page.locator('text=National Suicide Prevention')).toBeVisible();

    // Close dialog
    await page.click('button[aria-label="Close"]');
    await expect(page.locator('text=Emergency Support')).not.toBeVisible();
  });
});
