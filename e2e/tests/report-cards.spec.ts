import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockReportCard(id: string, studentName: string, studentCode: string) {
  return {
    id,
    student: {
      id: `stu-${id}`,
      firstName: studentName.split(' ')[0],
      lastName: studentName.split(' ')[1] ?? 'Test',
      studentCode,
    },
    term: { id: 't1', name: 'Term 1' },
    classSection: { id: 'cs1', name: 'Section A' },
    overallPercentage: 85.5,
    overallGpa: 3.5,
    rankInClass: 3,
    schoolId: SCHOOL_ID,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };
}

function paginatedReportCards(
  reportCards: unknown[],
  meta = { page: 1, limit: 10, total: reportCards.length, totalPages: 1 },
) {
  return { data: reportCards, meta };
}

test.describe('Report Cards List', () => {
  test('should display report cards list with data', async ({ page, apiMock, reportCardsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/report-cards*',
          paginatedReportCards([
            mockReportCard('rc1', 'Ahmed Ali', 'STU-001'),
            mockReportCard('rc2', 'Sara Hassan', 'STU-002'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/report-cards`);
    await expect(reportCardsPage.heading).toBeVisible();
    await reportCardsPage.expectReportCardCount(2);
  });

  test('should filter by year and term', async ({ page, apiMock, reportCardsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/report-cards*',
          paginatedReportCards([mockReportCard('rc1', 'Ahmed Ali', 'STU-001')]),
        );
        await mock.mockGet('**/api/v1/academic-years*', {
          data: [{ id: 'y1', name: '2024-2025' }],
        });
        await mock.mockGet('**/api/v1/academic-years/*/terms', {
          data: [{ id: 't1', name: 'Term 1', academicYearId: 'y1' }],
        });
        await mock.mockGet('**/api/v1/class-sections*', { data: [] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/report-cards`);
    await expect(reportCardsPage.heading).toBeVisible();

    // Select year first to reveal term filter
    await reportCardsPage.yearFilter.selectOption('y1');
    await expect(reportCardsPage.termFilter).toBeVisible();

    // Select term - should trigger request with termId
    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/report-cards') && req.url().includes('termId=t1'),
    );
    await reportCardsPage.termFilter.selectOption('t1');
    await requestPromise;
  });

  test('should open generate modal and verify dropdowns', async ({
    page,
    apiMock,
    reportCardsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/report-cards*', paginatedReportCards([]));
        await mock.mockGet('**/api/v1/academic-years*', {
          data: [{ id: 'y1', name: '2024-2025' }],
        });
        await mock.mockGet('**/api/v1/terms*', {
          data: [{ id: 't1', name: 'Term 1' }],
        });
        await mock.mockGet('**/api/v1/class-sections*', {
          data: [{ id: 'cs1', name: 'Section A' }],
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/report-cards`);
    await reportCardsPage.generateButton.click();
    await expect(reportCardsPage.generateModal).toBeVisible();
    await expect(reportCardsPage.genYear).toBeVisible();
    await expect(reportCardsPage.genTerm).toBeVisible();
    await expect(reportCardsPage.genClass).toBeVisible();
  });

  test('should show error state on API failure', async ({ page, apiMock, reportCardsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/report-cards*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/report-cards`);
    await expect(reportCardsPage.errorAlert).toBeVisible();
  });
});
