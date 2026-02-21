import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockFeeStructure(id: string, name: string, amount: number) {
  return {
    id,
    name,
    feeCategory: { id: `cat-${id}`, name: 'Tuition' },
    grade: { id: `g-${id}`, name: 'Grade 1' },
    amount,
    isRecurring: false,
    recurrence: null,
    schoolId: SCHOOL_ID,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function paginatedStructures(
  structures: unknown[],
  meta = { page: 1, limit: 10, total: structures.length, totalPages: 1 },
) {
  return { data: structures, meta };
}

test.describe('Fee Structures List', () => {
  test('should display fee structures list with data', async ({
    page,
    apiMock,
    feeStructuresPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-structures*',
          paginatedStructures([
            mockFeeStructure('fs1', 'Annual Tuition', 5000),
            mockFeeStructure('fs2', 'Lab Fee', 200),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-structures`);
    await expect(feeStructuresPage.heading).toBeVisible();
    await feeStructuresPage.expectStructureCount(2);
  });

  test('should filter by academic year', async ({ page, apiMock, feeStructuresPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-structures*',
          paginatedStructures([mockFeeStructure('fs1', 'Annual Tuition', 5000)]),
        );
        await mock.mockGet('**/api/v1/academic-years*', {
          data: [{ id: 'y1', name: '2024-2025' }],
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-structures`);
    await expect(feeStructuresPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/fee-structures') && req.url().includes('academicYearId=y1'),
    );
    await feeStructuresPage.yearFilter.selectOption('y1');
    await requestPromise;
  });

  test('should filter by grade', async ({ page, apiMock, feeStructuresPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-structures*',
          paginatedStructures([mockFeeStructure('fs1', 'Annual Tuition', 5000)]),
        );
        await mock.mockGet('**/api/v1/grades*', { data: [{ id: 'g1', name: 'Grade 1' }] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-structures`);
    await expect(feeStructuresPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/fee-structures') && req.url().includes('gradeId=g1'),
    );
    await feeStructuresPage.gradeFilter.selectOption('g1');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, feeStructuresPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/fee-structures*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-structures`);
    await expect(feeStructuresPage.errorAlert).toBeVisible();
  });
});
