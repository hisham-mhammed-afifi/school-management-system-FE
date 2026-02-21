import { test, expect } from '../fixtures/base.fixture';
import { mockMeResponse } from '../helpers/auth-setup.helper';

const SCHOOL_A = { id: 's1', name: 'School Alpha' };
const SCHOOL_B = { id: 's2', name: 'School Beta' };

test.describe('School Picker', () => {
  test('should display picker with multiple schools', async ({
    page,
    apiMock,
    schoolPickerPage,
  }) => {
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse([SCHOOL_A, SCHOOL_B]));
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'fake-access-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    await page.goto('/schools');
    await schoolPickerPage.expectVisible();
    await schoolPickerPage.expectSchoolCount(2);
    await expect(page.getByText('School Alpha')).toBeVisible();
    await expect(page.getByText('School Beta')).toBeVisible();
  });

  test('should navigate to dashboard when school is selected', async ({
    page,
    apiMock,
    schoolPickerPage,
  }) => {
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse([SCHOOL_A, SCHOOL_B]));
    await apiMock.mockGet(`**/api/v1/schools/${SCHOOL_A.id}`, {
      data: { id: SCHOOL_A.id, name: SCHOOL_A.name },
    });
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'fake-access-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    await page.goto('/schools');
    await schoolPickerPage.selectSchool('School Alpha');
    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_A.id}/dashboard`));
  });

  test('should auto-redirect when user has single school', async ({ page, apiMock }) => {
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse([SCHOOL_A]));
    await apiMock.mockGet(`**/api/v1/schools/${SCHOOL_A.id}`, {
      data: { id: SCHOOL_A.id, name: SCHOOL_A.name },
    });
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'fake-access-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    await page.goto('/schools');
    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_A.id}/dashboard`));
  });

  test('should show no schools message for super admin with empty platform', async ({
    page,
    apiMock,
    schoolPickerPage,
  }) => {
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    // Super admin: no school-scoped roles
    await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse([]));
    // Platform schools endpoint returns empty
    await apiMock.mockGet('**/api/v1/platform/schools*', { data: [] });
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'fake-access-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    await page.goto('/schools');
    await schoolPickerPage.expectNoSchools();
  });

  test('should allow logging out from school picker', async ({ page, apiMock }) => {
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      }),
    );
    await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse([SCHOOL_A, SCHOOL_B]));
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'fake-access-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    await page.goto('/schools');
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
