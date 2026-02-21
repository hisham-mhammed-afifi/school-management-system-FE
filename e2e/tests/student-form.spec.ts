import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

test.describe('Student Form', () => {
  test('should display create form with empty fields', async ({
    page,
    apiMock,
    studentFormPage,
  }) => {
    await setupAuthenticated(page, apiMock);

    await page.goto(`/schools/${SCHOOL_ID}/students/new`);
    await expect(studentFormPage.heading).toBeVisible();
    await expect(studentFormPage.studentCodeInput).toHaveValue('');
    await expect(studentFormPage.firstNameInput).toHaveValue('');
    await expect(studentFormPage.lastNameInput).toHaveValue('');
    await expect(studentFormPage.submitButton).toBeVisible();
  });

  test('should show validation errors on required fields', async ({
    page,
    apiMock,
    studentFormPage,
  }) => {
    await setupAuthenticated(page, apiMock);

    await page.goto(`/schools/${SCHOOL_ID}/students/new`);
    // Touch required fields without filling them to trigger validation
    await studentFormPage.studentCodeInput.click();
    await studentFormPage.firstNameInput.click();
    await studentFormPage.lastNameInput.click();
    await studentFormPage.dobInput.click();
    // Click elsewhere to blur the last field
    await studentFormPage.heading.click();
    await studentFormPage.expectValidationErrors();
    // Submit button should be disabled
    await expect(studentFormPage.submitButton).toBeDisabled();
  });

  test('should submit form with valid data', async ({ page, apiMock, studentFormPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockPost('**/api/v1/students', {
          data: {
            id: 'new-student-1',
            studentCode: 'STU-001',
            firstName: 'Ahmed',
            lastName: 'Ali',
          },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students/new`);
    await studentFormPage.fillRequiredFields({
      studentCode: 'STU-001',
      firstName: 'Ahmed',
      lastName: 'Ali',
      dob: '2010-05-15',
      admissionDate: '2024-09-01',
    });
    await studentFormPage.submit();

    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_ID}/students/new-student-1`));
  });

  test('should show server error on failed submission', async ({
    page,
    apiMock,
    studentFormPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockPost(
          '**/api/v1/students',
          { error: { message: 'Student code already exists' } },
          { status: 422 },
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/students/new`);
    await studentFormPage.fillRequiredFields({
      studentCode: 'STU-001',
      firstName: 'Ahmed',
      lastName: 'Ali',
      dob: '2010-05-15',
      admissionDate: '2024-09-01',
    });
    await studentFormPage.submit();

    await expect(studentFormPage.errorAlert).toBeVisible();
  });

  test('should navigate back to students list via cancel', async ({
    page,
    apiMock,
    studentFormPage,
  }) => {
    await setupAuthenticated(page, apiMock);

    await page.goto(`/schools/${SCHOOL_ID}/students/new`);
    await studentFormPage.cancelLink.click();
    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_ID}/students$`));
  });
});
