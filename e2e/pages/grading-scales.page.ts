import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class GradingScalesPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/grading-scales`;

    this.heading = page.getByRole('heading', { name: /grading scales/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectScaleCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
