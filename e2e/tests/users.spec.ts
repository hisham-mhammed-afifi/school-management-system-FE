import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockUser(id: string, email: string, isActive: boolean) {
  return {
    id,
    email,
    phone: '+1234567890',
    isActive,
    lastLoginAt: isActive ? '2024-12-01T10:00:00Z' : null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [{ roleId: 'r1', roleName: 'Teacher', schoolId: SCHOOL_ID, schoolName: 'Test School' }],
  };
}

function paginatedUsers(
  users: unknown[],
  meta = { page: 1, limit: 10, total: users.length, totalPages: 1 },
) {
  return { data: users, meta };
}

test.describe('Users List', () => {
  test('should display users list with data', async ({ page, apiMock, usersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/users*',
          paginatedUsers([
            mockUser('u1', 'teacher@school.com', true),
            mockUser('u2', 'admin@school.com', true),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/users`);
    await expect(usersPage.heading).toBeVisible();
    await usersPage.expectUserCount(2);
  });

  test('should show active and inactive status indicators', async ({
    page,
    apiMock,
    usersPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/users*',
          paginatedUsers([
            mockUser('u1', 'active@school.com', true),
            mockUser('u2', 'inactive@school.com', false),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/users`);
    await expect(usersPage.heading).toBeVisible();
    // Use status cell locators to avoid matching emails or hidden <option> elements
    await expect(page.locator('tbody .text-success-text').first()).toBeVisible();
    await expect(page.locator('tbody .text-error-text').first()).toBeVisible();
  });

  test('should filter users by search', async ({ page, apiMock, usersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/users*',
          paginatedUsers([mockUser('u1', 'teacher@school.com', true)]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/users`);
    await expect(usersPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/users') && req.url().includes('search=teacher'),
    );
    await usersPage.search('teacher');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, usersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/users*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/users`);
    await expect(usersPage.errorAlert).toBeVisible();
  });
});
