import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class FeeInvoicesPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly statusFilter: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/fee-invoices`;

    this.heading = page.getByRole('heading', { name: /fee invoices/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    this.statusFilter = page.locator('select[aria-label]').first();
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectInvoiceCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
