import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockRole(id: string, name: string, permissionCount = 5) {
  return {
    id,
    name,
    schoolId: SCHOOL_ID,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: Array.from({ length: permissionCount }, (_, i) => ({
      id: `p${i}`,
      slug: `perm.${i}`,
    })),
  };
}

function paginatedRoles(
  roles: unknown[],
  meta = { page: 1, limit: 10, total: roles.length, totalPages: 1 },
) {
  return { data: roles, meta };
}

test.describe('Roles List', () => {
  test('should display roles list with data', async ({ page, apiMock, rolesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/roles*',
          paginatedRoles([mockRole('r1', 'Custom Admin'), mockRole('r2', 'Custom Teacher')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await expect(rolesPage.heading).toBeVisible();
    await rolesPage.expectRoleCount(2);
  });

  test('should show empty state when no roles', async ({ page, apiMock, rolesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/roles*', paginatedRoles([]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await expect(rolesPage.noResults).toBeVisible();
  });

  test('should show System badge for seed roles', async ({ page, apiMock }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/roles*',
          paginatedRoles([mockRole('r1', 'school_admin'), mockRole('r2', 'Custom Role')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await expect(page.getByText('System')).toBeVisible();
  });

  test('should NOT show delete button for seed roles', async ({ page, apiMock }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/roles*',
          paginatedRoles([mockRole('r1', 'school_admin'), mockRole('r2', 'Custom Role')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    // Seed role card should not have delete button
    const seedCard = page.locator('.grid > div').filter({ hasText: 'school_admin' });
    await expect(seedCard.getByRole('button', { name: /delete/i })).toBeHidden();
    // Custom role card should have delete button
    const customCard = page.locator('.grid > div').filter({ hasText: 'Custom Role' });
    await expect(customCard.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test('should show delete confirmation modal when clicking delete', async ({
    page,
    apiMock,
    rolesPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/roles*', paginatedRoles([mockRole('r1', 'Custom Role')]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await rolesPage.getDeleteButton('Custom Role').click();
    await expect(rolesPage.deleteModal).toBeVisible();
  });

  test('should dismiss modal on cancel', async ({ page, apiMock, rolesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/roles*', paginatedRoles([mockRole('r1', 'Custom Role')]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await rolesPage.getDeleteButton('Custom Role').click();
    await expect(rolesPage.deleteModal).toBeVisible();
    await rolesPage.deleteCancelButton.click();
    await expect(rolesPage.deleteModal).toBeHidden();
  });

  test('should delete role on confirm', async ({ page, apiMock, rolesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/roles*', paginatedRoles([mockRole('r1', 'Custom Role')]));
        await mock.mockDelete('**/api/v1/roles/r1', { data: null });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/roles`);
    await rolesPage.getDeleteButton('Custom Role').click();
    await expect(rolesPage.deleteModal).toBeVisible();

    const deleteRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && req.url().includes('/roles/r1'),
    );
    await rolesPage.deleteConfirmButton.click();
    await deleteRequest;
    await expect(rolesPage.deleteModal).toBeHidden();
  });
});
