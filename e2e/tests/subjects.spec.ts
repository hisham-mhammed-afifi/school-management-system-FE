import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockSubject(id: string, name: string, code: string) {
  return {
    id,
    name,
    code,
    subjectGrades: [{ gradeId: 'g1', grade: { id: 'g1', name: 'Grade 1' } }],
    isLab: false,
    isElective: false,
    schoolId: SCHOOL_ID,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function paginatedSubjects(
  subjects: unknown[],
  meta = { page: 1, limit: 10, total: subjects.length, totalPages: 1 },
) {
  return { data: subjects, meta };
}

test.describe('Subjects List', () => {
  test('should display subjects list with data', async ({ page, apiMock, subjectsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/subjects*',
          paginatedSubjects([
            mockSubject('s1', 'Mathematics', 'MATH'),
            mockSubject('s2', 'Science', 'SCI'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/subjects`);
    await expect(subjectsPage.heading).toBeVisible();
    await subjectsPage.expectSubjectCount(2);
  });

  test('should search by name', async ({ page, apiMock, subjectsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/subjects*',
          paginatedSubjects([mockSubject('s1', 'Mathematics', 'MATH')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/subjects`);
    await expect(subjectsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/subjects') && req.url().includes('search=Math'),
    );
    await subjectsPage.search('Math');
    await requestPromise;
  });

  test('should filter by grade', async ({ page, apiMock, subjectsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/subjects*',
          paginatedSubjects([mockSubject('s1', 'Mathematics', 'MATH')]),
        );
        await mock.mockGet('**/api/v1/grades*', { data: [{ id: 'g1', name: 'Grade 1' }] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/subjects`);
    await expect(subjectsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/subjects') && req.url().includes('gradeId=g1'),
    );
    await subjectsPage.gradeFilter.selectOption('g1');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, subjectsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/subjects*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/subjects`);
    await expect(subjectsPage.errorAlert).toBeVisible();
  });
});
