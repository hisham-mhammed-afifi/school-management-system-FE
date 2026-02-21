import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockTeacher(id: string, firstName: string, lastName: string, status = 'active') {
  return {
    id,
    teacherCode: `TCH-${id}`,
    firstName,
    lastName,
    dateOfBirth: '1985-03-20',
    gender: 'male',
    nationalId: null,
    nationality: null,
    religion: null,
    bloodType: null,
    address: null,
    phone: null,
    email: `${firstName.toLowerCase()}@school.com`,
    specialization: 'Mathematics',
    hireDate: '2020-01-15',
    status,
    schoolId: SCHOOL_ID,
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  };
}

function paginatedTeachers(
  teachers: unknown[],
  meta = { page: 1, limit: 10, total: teachers.length, totalPages: 1 },
) {
  return { data: teachers, meta };
}

test.describe('Teachers List', () => {
  test('should display teachers list with data', async ({ page, apiMock, teachersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/teachers*',
          paginatedTeachers([
            mockTeacher('t1', 'Omar', 'Khalid'),
            mockTeacher('t2', 'Fatima', 'Noor'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/teachers`);
    await expect(teachersPage.heading).toBeVisible();
    await teachersPage.expectTeacherCount(2);
  });

  test('should filter teachers by status', async ({ page, apiMock, teachersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/teachers*',
          paginatedTeachers([mockTeacher('t1', 'Omar', 'Khalid')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/teachers`);
    await expect(teachersPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/teachers') && req.url().includes('status=active'),
    );
    await teachersPage.statusFilter.selectOption('active');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, teachersPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/teachers*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/teachers`);
    await expect(teachersPage.errorAlert).toBeVisible();
  });
});
