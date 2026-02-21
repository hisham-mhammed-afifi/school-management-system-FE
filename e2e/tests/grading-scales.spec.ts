import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockScale(id: string, name: string) {
  return {
    id,
    name,
    levels: [
      { id: `${id}-l1`, letter: 'A', minScore: 90, maxScore: 100, gpaPoints: 4.0 },
      { id: `${id}-l2`, letter: 'B', minScore: 80, maxScore: 89, gpaPoints: 3.0 },
    ],
    schoolId: SCHOOL_ID,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function paginatedScales(
  scales: unknown[],
  meta = { page: 1, limit: 10, total: scales.length, totalPages: 1 },
) {
  return { data: scales, meta };
}

test.describe('Grading Scales List', () => {
  test('should display grading scales list with data', async ({
    page,
    apiMock,
    gradingScalesPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/grading-scales*',
          paginatedScales([mockScale('gs1', 'Standard Scale'), mockScale('gs2', 'Advanced Scale')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/grading-scales`);
    await expect(gradingScalesPage.heading).toBeVisible();
    await gradingScalesPage.expectScaleCount(2);
  });

  test('should show error state on API failure', async ({ page, apiMock, gradingScalesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/grading-scales*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/grading-scales`);
    await expect(gradingScalesPage.errorAlert).toBeVisible();
  });
});
