import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockChild(id: string, firstName: string, lastName: string) {
  return {
    id,
    firstName,
    lastName,
    studentCode: `STU-${id}`,
  };
}

function mockGrade(id: string, examName: string, subjectName: string) {
  return {
    id,
    examSubject: {
      exam: { id: `ex-${id}`, name: examName },
      subject: { id: `sub-${id}`, name: subjectName },
      maxScore: 100,
    },
    score: 85,
    gradeLetter: 'A',
  };
}

function mockAttendanceRecord(id: string, date: string, status: string) {
  return {
    id,
    date,
    classSection: { id: 'cs1', name: 'Section A' },
    status,
    notes: null,
  };
}

test.describe('Parent Portal', () => {
  test('should display child cards', async ({ page, apiMock, parentPortalPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/my/children*', {
          data: [mockChild('c1', 'Ahmed', 'Ali'), mockChild('c2', 'Sara', 'Ali')],
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal`);
    await expect(parentPortalPage.heading).toBeVisible();
    await parentPortalPage.expectChildCount(2);
  });

  test('should navigate to child grades page', async ({ page, apiMock, parentPortalPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/my/children*', {
          data: [mockChild('c1', 'Ahmed', 'Ali')],
        });
        await mock.mockGet('**/api/v1/my/children/c1/grades*', {
          data: [mockGrade('g1', 'Midterm', 'Math')],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal`);
    await parentPortalPage.getChildGradesLink(0).click();

    await expect(page).toHaveURL(new RegExp(`/parent-portal/c1/grades`));
    await expect(page.locator('table')).toBeVisible();
  });

  test('should navigate to child attendance page', async ({ page, apiMock, parentPortalPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/my/children*', {
          data: [mockChild('c1', 'Ahmed', 'Ali')],
        });
        await mock.mockGet('**/api/v1/my/children/c1/attendance*', {
          data: [mockAttendanceRecord('a1', '2025-01-15', 'present')],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal`);
    await parentPortalPage.getChildAttendanceLink(0).click();

    await expect(page).toHaveURL(new RegExp(`/parent-portal/c1/attendance`));
    await expect(page.locator('table')).toBeVisible();
  });

  test('should navigate between tabs on child pages', async ({
    page,
    apiMock,
    parentPortalPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/my/children*', {
          data: [mockChild('c1', 'Ahmed', 'Ali')],
        });
        await mock.mockGet('**/api/v1/my/children/c1/grades*', {
          data: [mockGrade('g1', 'Midterm', 'Math')],
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        });
        await mock.mockGet('**/api/v1/my/children/c1/attendance*', {
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal`);
    await parentPortalPage.getChildGradesLink(0).click();
    await expect(page).toHaveURL(new RegExp(`/parent-portal/c1/grades`));

    // Click attendance tab via the child sections nav (not the sidebar nav)
    const childNav = page.locator('nav[aria-label]').last();
    const attendanceTab = childNav.getByRole('link', { name: /attendance/i });
    await attendanceTab.click();
    await expect(page).toHaveURL(new RegExp(`/parent-portal/c1/attendance`));
  });

  test('should show date filters on attendance page', async ({
    page,
    apiMock,
    parentPortalPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/my/children*', {
          data: [mockChild('c1', 'Ahmed', 'Ali')],
        });
        await mock.mockGet('**/api/v1/my/children/c1/attendance*', {
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal/c1/attendance`);
    await expect(parentPortalPage.attFrom).toBeVisible();
    await expect(parentPortalPage.attTo).toBeVisible();
  });

  test('should show error state when API fails', async ({ page, apiMock, parentPortalPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/my/children*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/parent-portal`);
    await expect(parentPortalPage.errorAlert).toBeVisible();
  });
});
