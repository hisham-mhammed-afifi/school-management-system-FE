import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

test.describe('Permission Guard', () => {
  test('should redirect to /schools when user lacks required permission', async ({
    page,
    apiMock,
  }) => {
    // Only grant dashboard.read — no students.list
    await setupAuthenticated(page, apiMock, {
      permissions: ['dashboard.read'],
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    // Guard redirects to /schools, then school picker auto-redirects to dashboard (single school user)
    await expect(page).not.toHaveURL(/\/students/);
  });

  test('should allow access when user has required permission', async ({
    page,
    apiMock,
    studentsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      permissions: ['dashboard.read', 'students.list'],
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.heading).toBeVisible();
  });
});
