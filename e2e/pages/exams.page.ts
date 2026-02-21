import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ExamsPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly typeFilter: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/exams`;

    this.heading = page.getByRole('heading', { name: /exams/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    this.typeFilter = page.locator('#exam-type-filter');
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectExamCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
