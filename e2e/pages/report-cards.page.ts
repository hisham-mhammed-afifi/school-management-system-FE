import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ReportCardsPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly yearFilter: Locator;
  readonly termFilter: Locator;
  readonly classFilter: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly generateButton: Locator;
  readonly generateModal: Locator;
  readonly genYear: Locator;
  readonly genTerm: Locator;
  readonly genClass: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/report-cards`;

    this.heading = page.getByRole('heading', { name: /report cards/i });
    this.yearFilter = page.locator('#rc-year-filter');
    this.termFilter = page.locator('#rc-term-filter');
    this.classFilter = page.locator('#rc-class-filter');
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.generateButton = page.getByRole('button', { name: /generate/i });
    this.generateModal = page.getByRole('dialog');
    this.genYear = page.locator('#gen-year');
    this.genTerm = page.locator('#gen-term');
    this.genClass = page.locator('#gen-class');
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectReportCardCount(count: number): Promise<void> {
    await expect(this.tableRows).toHaveCount(count);
  }
}
