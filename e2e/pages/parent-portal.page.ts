import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ParentPortalPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly childCards: Locator;
  readonly errorAlert: Locator;
  readonly noChildren: Locator;
  readonly tableRows: Locator;

  // Child attendance date filters
  readonly attFrom: Locator;
  readonly attTo: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/parent-portal`;

    this.heading = page.getByRole('heading', { level: 1 });
    this.childCards = page.locator('.grid > div');
    this.errorAlert = page.getByRole('alert');
    this.noChildren = page.getByText(/no children/i);
    this.tableRows = page.locator('tbody tr');

    this.attFrom = page.locator('#att-from');
    this.attTo = page.locator('#att-to');
  }

  async expectChildCount(count: number): Promise<void> {
    await expect(this.childCards).toHaveCount(count);
  }

  getChildGradesLink(index: number): Locator {
    return this.childCards.nth(index).getByRole('link', { name: /grades/i });
  }

  getChildAttendanceLink(index: number): Locator {
    return this.childCards.nth(index).getByRole('link', { name: /attendance/i });
  }
}
