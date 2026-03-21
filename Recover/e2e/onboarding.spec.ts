import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete onboarding process', async ({ page }) => {
    await page.goto('/');

    // Should show onboarding screen
    await expect(page.locator('text=Welcome to Recovery Journey')).toBeVisible();

    // Step 1: Enter recovery start date
    await page.fill('input[type="date"]', '2024-01-01');
    await page.click('button:has-text("Continue")');

    // Step 2: Select reasons for sobriety
    await page.click('text=Health');
    await page.click('text=Family');
    await page.click('button:has-text("Continue")');

    // Step 3: Enter daily cost (optional)
    await page.fill('input[type="number"]', '15');
    await page.click('button:has-text("Continue")');

    // Step 4: Complete onboarding
    await page.click('button:has-text("Start Journey")');

    // Should navigate to home screen
    await expect(page).toHaveURL('/app');
    await expect(page.locator('text=Days Sober')).toBeVisible();
  });

  test('should skip optional steps', async ({ page }) => {
    await page.goto('/');

    // Step 1: Enter recovery start date
    await page.fill('input[type="date"]', '2024-01-01');
    await page.click('button:has-text("Continue")');

    // Step 2: Skip reasons
    await page.click('button:has-text("Skip")');

    // Step 3: Skip cost
    await page.click('button:has-text("Skip")');

    // Step 4: Complete
    await page.click('button:has-text("Start Journey")');

    // Should still navigate to home screen
    await expect(page).toHaveURL('/app');
  });
});
