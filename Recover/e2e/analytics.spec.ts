import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app?tab=analytics');
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should display recovery progress chart', async ({ page }) => {
    // Check for chart canvas elements
    await expect(page.locator('canvas')).toBeVisible();

    // Check for progress stats
    await expect(page.locator('text=Total Days Sober')).toBeVisible();
    await expect(page.locator('text=Money Saved')).toBeVisible();
  });

  test('should display mood distribution', async ({ page }) => {
    // Check for mood chart
    await expect(page.locator('text=Mood Distribution')).toBeVisible();
  });

  test('should display weekly activity chart', async ({ page }) => {
    // Check for activity chart
    await expect(page.locator('text=Weekly Activity')).toBeVisible();
    await expect(page.locator('text=Meetings')).toBeVisible();
    await expect(page.locator('text=Meditations')).toBeVisible();
  });

  test('should show insights panel', async ({ page }) => {
    // Check for insights
    await expect(page.locator('text=Insights')).toBeVisible();
  });

  test('should filter data by date range', async ({ page }) => {
    // Open date range filter
    await page.click('button:has-text("Date Range")');

    // Select last 7 days
    await page.click('text=Last 7 Days');

    // Charts should update (check for loading indicator or updated data)
    await expect(page.locator('text=Last 7 Days')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button:has-text("Export")');

    // Wait for download
    const download = await downloadPromise;

    // Check download filename
    expect(download.suggestedFilename()).toContain('recovery-journey');
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
