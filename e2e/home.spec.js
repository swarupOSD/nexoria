import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Premium App Store/i);
});

test('homepage renders hero section', async ({ page }) => {
  await page.goto('/');

  // Check if hero title is visible
  const heroHeading = page.locator('h1').first();
  await expect(heroHeading).toBeVisible();
});
