import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class StudentFormPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly backLink: Locator;
  readonly studentCodeInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly genderSelect: Locator;
  readonly admissionDateInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly cancelLink: Locator;
  readonly errorAlert: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/students/new`;

    this.heading = page.getByRole('heading', { level: 1 });
    this.backLink = page.getByRole('link', { name: /back/i });
    this.studentCodeInput = page.locator('#student-code');
    this.firstNameInput = page.locator('#student-first-name');
    this.lastNameInput = page.locator('#student-last-name');
    this.dobInput = page.locator('#student-dob');
    this.genderSelect = page.locator('#student-gender');
    this.admissionDateInput = page.locator('#student-admission');
    this.emailInput = page.locator('#student-email');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelLink = page.getByRole('link', { name: /cancel/i });
    this.errorAlert = page.getByRole('alert');
    this.validationErrors = page.locator('.text-danger-text');
  }

  async fillRequiredFields(data: {
    studentCode: string;
    firstName: string;
    lastName: string;
    dob: string;
    admissionDate: string;
  }): Promise<void> {
    await this.studentCodeInput.fill(data.studentCode);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.dobInput.fill(data.dob);
    await this.admissionDateInput.fill(data.admissionDate);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectValidationErrors(): Promise<void> {
    await expect(this.validationErrors.first()).toBeVisible();
  }
}
