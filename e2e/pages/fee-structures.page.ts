import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class FeeStructuresPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly yearFilter: Locator;
  readonly gradeFilter: Locator;
  readonly categoryFilter: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/fee-structures`;

    this.heading = page.getByRole('heading', { name: /fee structures/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    // These filters use aria-label instead of IDs
    this.yearFilter = page.locator('select[aria-label]').first();
    this.gradeFilter = page.locator('select[aria-label]').nth(1);
    this.categoryFilter = page.locator('select[aria-label]').nth(2);
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectStructureCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
