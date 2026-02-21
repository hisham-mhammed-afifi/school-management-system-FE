import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SchoolPickerPage extends BasePage {
  readonly path = '/schools';

  readonly heading: Locator;
  readonly logoutButton: Locator;
  readonly noSchoolsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Select a School' });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.noSchoolsMessage = page.getByText(/no schools/i);
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async selectSchool(name: string): Promise<void> {
    await this.page.getByText(name).click();
  }

  async expectSchoolCount(count: number): Promise<void> {
    await expect(this.page.locator('main a')).toHaveCount(count);
  }

  async expectNoSchools(): Promise<void> {
    await expect(this.noSchoolsMessage).toBeVisible();
  }
}
