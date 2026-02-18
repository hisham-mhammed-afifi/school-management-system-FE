import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    const langButton = page.locator('app-language-switcher button');
    await expect(langButton).toHaveText('AR');

    await langButton.click();
    await expect(langButton).toHaveText('EN');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should toggle theme', async ({ page }) => {
    const darkButton = page.locator('app-theme-toggle button[aria-label="Dark"]');
    await darkButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
