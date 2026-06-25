import { test, expect } from '@playwright/test';

test.describe('App Management E2E', () => {
  test('Create and verify app', async ({ page }) => {
    // Setup local storage auth
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        _id: "6a2f9ba4db1cbdc91ee649a2",
        name: "Super Admin",
        email: "superadmin@example.com",
        role: "superadmin"
      }));
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTJmOWJhNGRiMWNiZGM5MWVlNjQ5YTIiLCJpYXQiOjE3ODE4NjMxODQsImV4cCI6MTc4MjQ2Nzk4NH0.1kw6wo_rTwWLvDSP9kX9JKb22W6wXnoFr2_nPTHaUQQ');
    });
    await page.reload();

    // Navigate to Admin Posts Create
    await page.goto('/admin/posts/create');
    await expect(page.locator('text="Create New Post"').first()).toBeVisible();

    // Fill form
    const randomSuffix = Math.floor(Math.random() * 100000);
    const title = `Playwright UI Test App ${randomSuffix}`;
    await page.fill('input[name="title"]', title);
    await page.fill('input[name="slug"]', `playwright-ui-test-${randomSuffix}`);
    await page.fill('input[name="packageName"]', `com.playwright.${randomSuffix}`);
    await page.fill('input[name="publisher"]', `Playwright Publisher`);
    
    // Add App Logo and Featured Image
    await page.fill('[data-testid="image-upload-url-app-logo"]', 'https://example.com/logo.png');
    await page.click('[data-testid="image-upload-apply-app-logo"]');
    
    await page.fill('[data-testid="image-upload-url-featured-image"]', 'https://example.com/featured.png');
    await page.click('[data-testid="image-upload-apply-featured-image"]');
    
    // Category is automatically selected by the component

    // Check Featured & Trending
    await page.check('input[name="isFeatured"]', { force: true });
    await page.check('input[name="isTrending"]', { force: true });

    // Add Download Link
    await page.click('button:has-text("Add Link")', { force: true });
    await page.fill('input[placeholder="e.g. Mediafire"]', 'Direct Download');
    await page.fill('input[placeholder="https://..."]', 'https://example.com/dl');

    // Set Status
    await page.selectOption('select[name="status"]', 'Published');

    // Click Save
    await page.click('button:has-text("Save & Close")', { force: true });

    // Wait for navigation or success toast
    await expect(page.locator('text="Post created successfully"').first()).toBeVisible({ timeout: 10000 });

    // Verify Homepage
    await page.goto('/');
    await expect(page.locator(`text="${title}"`).first()).toBeVisible();

    console.log('✔ App Creation from UI verified');
  });
});
