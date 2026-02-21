import { type Page } from '@playwright/test';
import { ApiMockHelper } from './api-mock.helper';

const DEFAULT_SCHOOL_ID = 'test-school-1';

const ALL_PERMISSIONS = [
  'dashboard.read',
  'users.list',
  'users.create',
  'users.update',
  'students.list',
  'students.create',
  'students.update',
  'teachers.list',
  'teachers.create',
  'class-sections.list',
  'class-sections.create',
  'class-sections.update',
  'class-sections.delete',
  'subjects.list',
  'subjects.create',
  'subjects.update',
  'subjects.delete',
  'roles.list',
  'roles.create',
  'roles.delete',
  'exams.list',
  'exams.create',
  'fee-structures.list',
  'fee-structures.create',
  'fee-structures.update',
  'fee-structures.delete',
  'fee-invoices.list',
  'fee-invoices.create',
  'fee-invoices.update',
  'fee-payments.create',
  'grading-scales.list',
  'grading-scales.create',
  'grading-scales.update',
  'grading-scales.delete',
  'lessons.list',
  'student-attendance.list',
  'teacher-attendance.list',
  'student-grades.list',
  'report-cards.list',
  'report-cards.generate',
  'report-cards.update',
];

interface SetupOptions {
  schoolId?: string;
  permissions?: string[];
  extraMocks?: (apiMock: ApiMockHelper) => Promise<void>;
}

/** Build a mock /auth/me response */
export function mockMeResponse(
  schools: { id: string; name: string }[],
  permissions: string[] = ALL_PERMISSIONS,
): { data: Record<string, unknown> } {
  return {
    data: {
      id: 'u1',
      email: 'admin@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: schools.map((s, i) => ({
        roleId: `r${i + 1}`,
        roleName: 'Admin',
        schoolId: s.id,
        schoolName: s.name,
      })),
      permissions,
    },
  };
}

/**
 * Sets up full auth context for any authenticated page test.
 * 1. Registers catch-all route (returns { data: [] })
 * 2. Mocks GET /auth/me with given permissions
 * 3. Mocks GET /schools/:id
 * 4. Runs optional extraMocks callback
 * 5. Sets localStorage tokens
 */
export async function setupAuthenticated(
  page: Page,
  apiMock: ApiMockHelper,
  options: SetupOptions = {},
): Promise<{ schoolId: string }> {
  const schoolId = options.schoolId ?? DEFAULT_SCHOOL_ID;
  const permissions = options.permissions ?? ALL_PERMISSIONS;

  // Catch-all FIRST (Playwright LIFO means specific mocks registered after take priority)
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );

  // Auth
  await apiMock.mockGet(
    '**/api/v1/auth/me',
    mockMeResponse([{ id: schoolId, name: 'Test School' }], permissions),
  );

  // School context
  await apiMock.mockGet(`**/api/v1/schools/${schoolId}`, {
    data: { id: schoolId, name: 'Test School' },
  });

  // Feature-specific mocks
  if (options.extraMocks) {
    await options.extraMocks(apiMock);
  }

  // Set auth tokens before navigation
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'fake-access-token');
    localStorage.setItem('refresh_token', 'fake-refresh-token');
  });

  return { schoolId };
}
