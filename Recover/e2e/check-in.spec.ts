import { test, expect } from '@playwright/test';

test.describe('Daily Check-In', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app (assuming onboarding is complete)
    await page.goto('/app');

    // Wait for app to load
    await expect(page.locator('text=Days Sober')).toBeVisible();
  });

  test('should complete daily check-in', async ({ page }) => {
    // Open check-in dialog
    await page.click('button:has-text("Check In")');

    // Should show check-in form
    await expect(page.locator('text=How are you feeling today?')).toBeVisible();

    // Select mood
    await page.click('button[aria-label="Mood 8"]');

    // Add notes
    await page.fill('textarea[placeholder*="thoughts"]', 'Feeling great today!');

    // Add trigger
    await page.click('text=Stress');

    // Add coping strategy
    await page.click('text=Meditation');

    // Submit check-in
    await page.click('button:has-text("Submit")');

    // Should show success message
    await expect(page.locator('text=Check-in saved')).toBeVisible();

    // Check-in should appear in history
    await expect(page.locator('text=Feeling great today!')).toBeVisible();
  });

  test('should require mood selection', async ({ page }) => {
    await page.click('button:has-text("Check In")');

    // Try to submit without mood
    await page.click('button:has-text("Submit")');

    // Should show validation message
    await expect(page.locator('text=Please select your mood')).toBeVisible();
  });

  test('should allow editing recent check-in', async ({ page }) => {
    // Create a check-in first
    await page.click('button:has-text("Check In")');
    await page.click('button[aria-label="Mood 7"]');
    await page.fill('textarea', 'Initial notes');
    await page.click('button:has-text("Submit")');

    // Wait for success
    await expect(page.locator('text=Check-in saved')).toBeVisible();

    // Edit the check-in
    await page.click('button[aria-label="Edit check-in"]');
    await page.fill('textarea', 'Updated notes');
    await page.click('button:has-text("Save")');

    // Should show updated notes
    await expect(page.locator('text=Updated notes')).toBeVisible();
  });
});
