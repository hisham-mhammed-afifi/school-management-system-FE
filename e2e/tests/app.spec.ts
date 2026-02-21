import { test, expect } from '../fixtures/base.fixture';

test.describe('App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });

  test('should toggle language', async ({ page }) => {
    const langButton = page.locator('app-language-switcher button');
    await expect(langButton).toHaveText('AR');

    await langButton.click();
    await expect(langButton).toHaveText('EN');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should toggle theme', async ({ page }) => {
    const darkButton = page.getByRole('switch', { name: 'Dark mode' });
    await darkButton.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
