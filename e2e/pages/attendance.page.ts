import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AttendancePage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly studentTab: Locator;
  readonly teacherTab: Locator;

  // Student attendance
  readonly classSelect: Locator;
  readonly dateSelect: Locator;
  readonly markAll: Locator;

  // Teacher attendance
  readonly teacherDateSelect: Locator;

  readonly tableRows: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/attendance`;

    this.heading = page.getByRole('heading', { name: /attendance/i });
    this.studentTab = page.getByRole('tab', { name: /students/i });
    this.teacherTab = page.getByRole('tab', { name: /teachers/i });

    this.classSelect = page.locator('#class-select');
    this.dateSelect = page.locator('#date-select');
    this.markAll = page.locator('#mark-all');

    this.teacherDateSelect = page.locator('#teacher-date-select');

    this.tableRows = page.locator('tbody tr');
    this.errorAlert = page.getByRole('alert');
  }

  getStudentStatusSelect(index: number): Locator {
    return this.page.locator(`#status-${index}`);
  }

  getTeacherStatusSelect(index: number): Locator {
    return this.page.locator(`#teacher-status-${index}`);
  }
}
