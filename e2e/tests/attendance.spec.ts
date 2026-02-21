import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockClassSection(id: string, name: string) {
  return { id, name, schoolId: SCHOOL_ID };
}

function mockEnrollment(studentId: string, firstName: string, lastName: string, code: string) {
  return {
    id: `enr-${studentId}`,
    studentId,
    student: { id: studentId, firstName, lastName, studentCode: code },
    classSectionId: 'cs1',
    status: 'active',
  };
}

function mockTeacher(id: string, firstName: string, lastName: string, code: string) {
  return {
    id,
    teacherCode: code,
    firstName,
    lastName,
    status: 'active',
    schoolId: SCHOOL_ID,
  };
}

test.describe('Attendance', () => {
  test('should show student and teacher tabs', async ({ page, apiMock, attendancePage }) => {
    await setupAuthenticated(page, apiMock);

    await page.goto(`/schools/${SCHOOL_ID}/attendance`);
    await expect(attendancePage.heading).toBeVisible();
    await expect(attendancePage.studentTab).toBeVisible();
    await expect(attendancePage.teacherTab).toBeVisible();
  });

  test('should display student attendance rows after selecting class and date', async ({
    page,
    apiMock,
    attendancePage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/class-sections*', {
          data: [mockClassSection('cs1', 'Section A')],
        });
        await mock.mockGet('**/api/v1/enrollments*', {
          data: [
            mockEnrollment('st1', 'Ahmed', 'Ali', 'STU-001'),
            mockEnrollment('st2', 'Sara', 'Hassan', 'STU-002'),
          ],
        });
        await mock.mockGet('**/api/v1/student-attendances*', { data: [] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/attendance`);
    await expect(attendancePage.heading).toBeVisible();

    await attendancePage.classSelect.selectOption('cs1');
    await attendancePage.dateSelect.fill('2025-01-15');
    await attendancePage.dateSelect.dispatchEvent('change');

    await expect(attendancePage.tableRows.first()).toBeVisible();
  });

  test('should mark all students with bulk selector', async ({ page, apiMock, attendancePage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/class-sections*', {
          data: [mockClassSection('cs1', 'Section A')],
        });
        await mock.mockGet('**/api/v1/enrollments*', {
          data: [mockEnrollment('st1', 'Ahmed', 'Ali', 'STU-001')],
        });
        await mock.mockGet('**/api/v1/student-attendances*', { data: [] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/attendance`);
    await attendancePage.classSelect.selectOption('cs1');
    await attendancePage.dateSelect.fill('2025-01-15');
    await attendancePage.dateSelect.dispatchEvent('change');

    await expect(attendancePage.markAll).toBeVisible();
    await attendancePage.markAll.selectOption('present');

    // Verify the individual status select was set to present
    await expect(attendancePage.getStudentStatusSelect(0)).toHaveValue('present');
  });

  test('should switch to teacher tab and display teacher rows', async ({
    page,
    apiMock,
    attendancePage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/teachers*', {
          data: [
            mockTeacher('t1', 'Omar', 'Khalid', 'TCH-001'),
            mockTeacher('t2', 'Fatima', 'Noor', 'TCH-002'),
          ],
        });
        await mock.mockGet('**/api/v1/teacher-attendances*', { data: [] });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/attendance`);
    await attendancePage.teacherTab.click();

    await attendancePage.teacherDateSelect.fill('2025-01-15');
    await attendancePage.teacherDateSelect.dispatchEvent('change');

    await expect(attendancePage.tableRows.first()).toBeVisible();
  });

  test('should show error state on API failure', async ({ page, apiMock, attendancePage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/class-sections*', {
          data: [mockClassSection('cs1', 'Section A')],
        });
        await mock.mockError('**/api/v1/enrollments*', 500, 'Server Error');
        await mock.mockError('**/api/v1/student-attendances*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/attendance`);
    await attendancePage.classSelect.selectOption('cs1');
    await attendancePage.dateSelect.fill('2025-01-15');
    await attendancePage.dateSelect.dispatchEvent('change');

    await expect(attendancePage.errorAlert).toBeVisible();
  });
});
