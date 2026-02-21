import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

const MOCK_YEARS = { data: [{ id: 'y1', name: '2024-2025' }] };
const MOCK_TERMS = { data: [{ id: 't1', name: 'Term 1', academicYearId: 'y1' }] };
const MOCK_PERIOD_SETS = { data: [{ id: 'ps1', name: 'Default Set', academicYearId: 'y1' }] };
const MOCK_PERIODS = {
  data: [
    {
      id: 'p1',
      name: 'Period 1',
      startTime: '08:00',
      endTime: '08:45',
      orderIndex: 1,
      isBreak: false,
    },
    {
      id: 'p2',
      name: 'Break',
      startTime: '08:45',
      endTime: '09:00',
      orderIndex: 2,
      isBreak: true,
    },
  ],
};
const MOCK_WORKING_DAYS = {
  data: [
    { id: 'wd1', dayOfWeek: 1, isActive: true },
    { id: 'wd2', dayOfWeek: 2, isActive: true },
  ],
};
const MOCK_CLASS_SECTIONS = {
  data: [{ id: 'cs1', name: 'Section A' }],
};

test.describe('Timetable', () => {
  test('should show cascading dropdowns', async ({ page, apiMock, timetablePage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/academic-years*', MOCK_YEARS);
        await mock.mockGet('**/api/v1/academic-years/*/terms', MOCK_TERMS);
        await mock.mockGet('**/api/v1/period-sets*', MOCK_PERIOD_SETS);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/timetable`);
    await expect(timetablePage.heading).toBeVisible();
    await expect(timetablePage.yearSelect).toBeVisible();

    // Term and period-set are hidden until year is selected
    await expect(timetablePage.termSelect).toBeHidden();
    await expect(timetablePage.periodSetSelect).toBeHidden();

    await timetablePage.yearSelect.selectOption('y1');

    // After year selection, term and period-set should appear
    await expect(timetablePage.termSelect).toBeVisible();
    await expect(timetablePage.periodSetSelect).toBeVisible();
  });

  test('should show view type tabs after selecting term and period set', async ({
    page,
    apiMock,
    timetablePage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/academic-years*', MOCK_YEARS);
        await mock.mockGet('**/api/v1/academic-years/*/terms', MOCK_TERMS);
        await mock.mockGet('**/api/v1/period-sets*', MOCK_PERIOD_SETS);
        await mock.mockGet('**/api/v1/period-sets/ps1/periods', MOCK_PERIODS);
        await mock.mockGet('**/api/v1/period-sets/ps1/working-days', MOCK_WORKING_DAYS);
        await mock.mockGet('**/api/v1/class-sections*', MOCK_CLASS_SECTIONS);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/timetable`);
    await timetablePage.yearSelect.selectOption('y1');
    await timetablePage.termSelect.selectOption('t1');
    await timetablePage.periodSetSelect.selectOption('ps1');

    await expect(timetablePage.classTab).toBeVisible();
    await expect(timetablePage.teacherTab).toBeVisible();
    await expect(timetablePage.roomTab).toBeVisible();
  });

  test('should display timetable grid after selecting entity', async ({
    page,
    apiMock,
    timetablePage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/academic-years*', MOCK_YEARS);
        await mock.mockGet('**/api/v1/academic-years/*/terms', MOCK_TERMS);
        await mock.mockGet('**/api/v1/period-sets*', MOCK_PERIOD_SETS);
        await mock.mockGet('**/api/v1/period-sets/ps1/periods', MOCK_PERIODS);
        await mock.mockGet('**/api/v1/period-sets/ps1/working-days', MOCK_WORKING_DAYS);
        await mock.mockGet('**/api/v1/class-sections*', MOCK_CLASS_SECTIONS);
        await mock.mockGet('**/api/v1/timetable/class/cs1*', { data: [] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/timetable`);
    await timetablePage.yearSelect.selectOption('y1');
    await timetablePage.termSelect.selectOption('t1');
    await timetablePage.periodSetSelect.selectOption('ps1');

    // Click the Class tab to trigger loadEntities() for classes
    await timetablePage.classTab.click();
    await expect(timetablePage.entitySelect).toBeVisible();
    await timetablePage.entitySelect.selectOption('cs1');

    await expect(timetablePage.timetableGrid).toBeVisible();
  });

  test('should switch view type tabs', async ({ page, apiMock, timetablePage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/academic-years*', MOCK_YEARS);
        await mock.mockGet('**/api/v1/academic-years/*/terms', MOCK_TERMS);
        await mock.mockGet('**/api/v1/period-sets*', MOCK_PERIOD_SETS);
        await mock.mockGet('**/api/v1/period-sets/ps1/periods', MOCK_PERIODS);
        await mock.mockGet('**/api/v1/period-sets/ps1/working-days', MOCK_WORKING_DAYS);
        await mock.mockGet('**/api/v1/class-sections*', MOCK_CLASS_SECTIONS);
        await mock.mockGet('**/api/v1/teachers*', {
          data: [{ id: 't1', firstName: 'Omar', lastName: 'Khalid' }],
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/timetable`);
    await timetablePage.yearSelect.selectOption('y1');
    await timetablePage.termSelect.selectOption('t1');
    await timetablePage.periodSetSelect.selectOption('ps1');

    // Default is class tab
    await expect(timetablePage.classTab).toHaveAttribute('aria-selected', 'true');

    // Switch to teacher tab
    await timetablePage.teacherTab.click();
    await expect(timetablePage.teacherTab).toHaveAttribute('aria-selected', 'true');
    await expect(timetablePage.classTab).toHaveAttribute('aria-selected', 'false');
  });
});
