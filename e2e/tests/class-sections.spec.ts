import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockSection(id: string, name: string, gradeName: string, yearName: string) {
  return {
    id,
    name,
    grade: { id: `g-${id}`, name: gradeName },
    academicYear: { id: `y-${id}`, name: yearName },
    capacity: 30,
    homeroomTeacher: { firstName: 'Omar', lastName: 'Khalid' },
    schoolId: SCHOOL_ID,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function paginatedSections(
  sections: unknown[],
  meta = { page: 1, limit: 10, total: sections.length, totalPages: 1 },
) {
  return { data: sections, meta };
}

test.describe('Class Sections List', () => {
  test('should display class sections list with data', async ({
    page,
    apiMock,
    classSectionsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/class-sections*',
          paginatedSections([
            mockSection('cs1', 'Section A', 'Grade 1', '2024-2025'),
            mockSection('cs2', 'Section B', 'Grade 2', '2024-2025'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/class-sections`);
    await expect(classSectionsPage.heading).toBeVisible();
    await classSectionsPage.expectSectionCount(2);
  });

  test('should filter by academic year', async ({ page, apiMock, classSectionsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/class-sections*',
          paginatedSections([mockSection('cs1', 'Section A', 'Grade 1', '2024-2025')]),
        );
        await mock.mockGet('**/api/v1/academic-years*', {
          data: [{ id: 'y1', name: '2024-2025' }],
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/class-sections`);
    await expect(classSectionsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/class-sections') && req.url().includes('academicYearId=y1'),
    );
    await classSectionsPage.yearFilter.selectOption('y1');
    await requestPromise;
  });

  test('should filter by grade', async ({ page, apiMock, classSectionsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/class-sections*',
          paginatedSections([mockSection('cs1', 'Section A', 'Grade 1', '2024-2025')]),
        );
        await mock.mockGet('**/api/v1/grades*', { data: [{ id: 'g1', name: 'Grade 1' }] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/class-sections`);
    await expect(classSectionsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/class-sections') && req.url().includes('gradeId=g1'),
    );
    await classSectionsPage.gradeFilter.selectOption('g1');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, classSectionsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/class-sections*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/class-sections`);
    await expect(classSectionsPage.errorAlert).toBeVisible();
  });
});
