import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockExam(id: string, name: string, examType: string) {
  return {
    id,
    name,
    examType,
    weight: 30,
    startDate: '2025-01-15',
    endDate: '2025-01-20',
    schoolId: SCHOOL_ID,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  };
}

function paginatedExams(
  exams: unknown[],
  meta = { page: 1, limit: 10, total: exams.length, totalPages: 1 },
) {
  return { data: exams, meta };
}

test.describe('Exams List', () => {
  test('should display exams list with data', async ({ page, apiMock, examsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/exams*',
          paginatedExams([
            mockExam('e1', 'Midterm Math', 'midterm'),
            mockExam('e2', 'Final Science', 'final'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/exams`);
    await expect(examsPage.heading).toBeVisible();
    await examsPage.expectExamCount(2);
  });

  test('should filter exams by type', async ({ page, apiMock, examsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/exams*',
          paginatedExams([mockExam('e1', 'Midterm Math', 'midterm')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/exams`);
    await expect(examsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/exams') && req.url().includes('examType=midterm'),
    );
    await examsPage.typeFilter.selectOption('midterm');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, examsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/exams*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/exams`);
    await expect(examsPage.errorAlert).toBeVisible();
  });
});
