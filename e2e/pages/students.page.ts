import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class StudentsPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly noResults: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/students`;

    this.heading = page.getByRole('heading', { name: /students/i });
    this.addButton = page.getByRole('link', { name: /add/i });
    this.searchInput = page.locator('#student-search');
    this.statusFilter = page.locator('#status-filter');
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noResults = page.getByText(/no results/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectStudentCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
  }

  async expectPaginationVisible(): Promise<void> {
    await expect(this.pagination).toBeVisible();
  }
}
