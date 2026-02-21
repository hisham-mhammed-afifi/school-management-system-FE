import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SendNotificationPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly backLink: Locator;
  readonly titleInput: Locator;
  readonly bodyInput: Locator;
  readonly channelButtons: Locator;
  readonly userCheckboxes: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;
  readonly successMessage: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/notifications/send`;

    this.heading = page.getByRole('heading', { name: /send notification/i });
    this.backLink = page.getByLabel(/back/i);
    this.titleInput = page.locator('#notification-title');
    this.bodyInput = page.locator('#notification-body');
    this.channelButtons = page.locator('button').filter({ hasText: /in.app|email|sms|push/i });
    this.userCheckboxes = page.getByRole('checkbox');
    this.submitButton = page.getByRole('button', { name: /send/i });
    this.cancelButton = page.getByRole('link', { name: /cancel/i });
    this.errorAlert = page.getByRole('alert');
    this.successMessage = page.locator('.bg-success-bg');
  }

  async fillForm(title: string, body: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.bodyInput.fill(body);
  }

  async selectUser(index: number): Promise<void> {
    await this.userCheckboxes.nth(index).check();
  }

  async toggleChannel(name: string): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(name, 'i') }).click();
  }

  async expectUserCount(count: number): Promise<void> {
    await expect(this.userCheckboxes).toHaveCount(count);
  }
}
