import { test, expect } from '../fixtures/base.fixture';

const SCHOOL_ID = 'test-school-1';

/** Mock UserProfile matching GET /api/v1/auth/me */
const mockMeResponse = {
  data: {
    id: 'u1',
    email: 'admin@test.com',
    phone: null,
    isActive: true,
    lastLoginAt: null,
    roles: [
      {
        roleId: 'r1',
        roleName: 'Admin',
        schoolId: SCHOOL_ID,
        schoolName: 'Test School',
      },
    ],
    permissions: [
      'dashboard.read',
      'users.list',
      'students.list',
      'teachers.list',
      'class-sections.list',
      'subjects.list',
    ],
  },
};

const mockDashboardOverview = {
  data: {
    totalStudents: 150,
    totalTeachers: 25,
    totalClasses: 10,
    attendanceRate: 92.5,
  },
};

const mockDashboardFees = {
  data: { collected: 50000, outstanding: 15000, overdue: 5000 },
};

const emptyList = { data: [] };
const emptyPaginatedList = {
  data: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

/** Shared setup: mock all API endpoints and set auth tokens */
async function setupAuthenticatedDashboard(
  page: import('@playwright/test').Page,
  apiMock: import('../helpers/api-mock.helper').ApiMockHelper,
  overrides?: { overviewStatus?: number },
) {
  // Catch-all for any unhandled API calls to prevent hitting real backend
  await page.route('**/api/v1/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Auth
  await apiMock.mockGet('**/api/v1/auth/me', mockMeResponse);

  // Dashboard
  if (overrides?.overviewStatus === 500) {
    await page.route('**/api/v1/dashboard/overview*', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal error' } }),
      }),
    );
  } else {
    await apiMock.mockGet('**/api/v1/dashboard/overview*', mockDashboardOverview);
  }
  await apiMock.mockGet('**/api/v1/dashboard/fees*', mockDashboardFees);
  await apiMock.mockGet('**/api/v1/dashboard/attendance*', emptyList);
  await apiMock.mockGet('**/api/v1/dashboard/activity*', emptyList);

  // Other pages
  await apiMock.mockGet('**/api/v1/users*', emptyPaginatedList);
  await apiMock.mockGet('**/api/v1/roles*', emptyList);

  // School
  await apiMock.mockGet('**/api/v1/schools/' + SCHOOL_ID, {
    data: { id: SCHOOL_ID, name: 'Test School' },
  });

  // Set auth tokens before navigation
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'fake-access-token');
    localStorage.setItem('refresh_token', 'fake-refresh-token');
  });
}

test.describe('Dashboard', () => {
  test('should display dashboard heading', async ({ page, apiMock }) => {
    await setupAuthenticatedDashboard(page, apiMock);
    await page.goto(`/schools/${SCHOOL_ID}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should show sidebar navigation', async ({ page, apiMock }) => {
    await setupAuthenticatedDashboard(page, apiMock);
    await page.goto(`/schools/${SCHOOL_ID}/dashboard`);
    const sidebar = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to other sections from sidebar', async ({ page, apiMock }) => {
    await setupAuthenticatedDashboard(page, apiMock);
    await page.goto(`/schools/${SCHOOL_ID}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.getByRole('navigation', { name: 'Main navigation' });
    const usersLink = sidebar.getByRole('link', { name: 'Users' });
    await usersLink.waitFor({ state: 'visible' });
    await usersLink.click({ force: true });
    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_ID}/users`));
  });

  test('should show loading skeleton then content', async ({ page, apiMock }) => {
    await setupAuthenticatedDashboard(page, apiMock);
    // Override overview with delay
    await apiMock.mockGet('**/api/v1/dashboard/overview*', mockDashboardOverview, { delay: 500 });

    await page.goto(`/schools/${SCHOOL_ID}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should handle dashboard API error', async ({ page, apiMock }) => {
    await setupAuthenticatedDashboard(page, apiMock, { overviewStatus: 500 });
    await page.goto(`/schools/${SCHOOL_ID}/dashboard`);
    await expect(page.getByText(/failed to load/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
