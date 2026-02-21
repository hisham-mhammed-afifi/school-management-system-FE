import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockStudent(id: string, firstName: string, lastName: string, status = 'active') {
  return {
    id,
    studentCode: `STU-${id}`,
    firstName,
    lastName,
    dateOfBirth: '2010-05-15',
    gender: 'male',
    nationalId: null,
    nationality: null,
    religion: null,
    bloodType: null,
    address: null,
    phone: null,
    email: `${firstName.toLowerCase()}@test.com`,
    photoUrl: null,
    medicalNotes: null,
    admissionDate: '2024-09-01',
    status,
    schoolId: SCHOOL_ID,
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  };
}

function paginatedStudents(
  students: unknown[],
  meta = { page: 1, limit: 10, total: students.length, totalPages: 1 },
) {
  return { data: students, meta };
}

test.describe('Students List', () => {
  test('should display students list with data', async ({ page, apiMock, studentsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/students*',
          paginatedStudents([mockStudent('1', 'Ahmed', 'Ali'), mockStudent('2', 'Sara', 'Hassan')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.heading).toBeVisible();
    await studentsPage.expectStudentCount(2);
  });

  test('should show empty state when no students', async ({ page, apiMock, studentsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/students*', paginatedStudents([]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.noResults).toBeVisible();
  });

  test('should filter students by search term', async ({ page, apiMock, studentsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/students*',
          paginatedStudents([mockStudent('1', 'Ahmed', 'Ali')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/students') && req.url().includes('search=Ahmed'),
    );
    await studentsPage.search('Ahmed');
    await requestPromise;
  });

  test('should filter students by status', async ({ page, apiMock, studentsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/students*',
          paginatedStudents([mockStudent('1', 'Ahmed', 'Ali')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/students') && req.url().includes('status=active'),
    );
    await studentsPage.filterByStatus('active');
    await requestPromise;
  });

  test('should display pagination for large lists', async ({ page, apiMock, studentsPage }) => {
    const students = Array.from({ length: 10 }, (_, i) =>
      mockStudent(`${i + 1}`, `Student${i + 1}`, 'Test'),
    );
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/students*',
          paginatedStudents(students, { page: 1, limit: 10, total: 25, totalPages: 3 }),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await studentsPage.expectPaginationVisible();
  });

  test('should navigate to next page', async ({ page, apiMock, studentsPage }) => {
    const students = Array.from({ length: 10 }, (_, i) =>
      mockStudent(`${i + 1}`, `Student${i + 1}`, 'Test'),
    );
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/students*',
          paginatedStudents(students, { page: 1, limit: 10, total: 25, totalPages: 3 }),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await studentsPage.expectPaginationVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/students') && req.url().includes('page=2'),
    );
    await page.getByRole('button', { name: /next/i }).click();
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, studentsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/students*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students`);
    await expect(studentsPage.errorAlert).toBeVisible();
  });
});
