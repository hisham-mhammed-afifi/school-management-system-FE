import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class NotificationsPage extends BasePage {
  readonly path: string;

  readonly heading: Locator;
  readonly sendButton: Locator;
  readonly markAllReadButton: Locator;
  readonly readFilter: Locator;
  readonly channelFilter: Locator;
  readonly notificationItems: Locator;
  readonly emptyState: Locator;
  readonly errorAlert: Locator;
  readonly pagination: Locator;

  constructor(page: Page, schoolId = 'test-school-1') {
    super(page);
    this.path = `/schools/${schoolId}/notifications`;

    this.heading = page.getByRole('heading', { name: /notifications/i });
    this.sendButton = page.getByRole('link', { name: /send/i });
    this.markAllReadButton = page.getByRole('button', { name: /mark all/i });
    this.readFilter = page.locator('#read-filter');
    this.channelFilter = page.locator('#channel-filter');
    this.notificationItems = page.getByRole('listitem');
    this.emptyState = page.getByText(/no notifications/i);
    this.errorAlert = page.getByRole('alert');
    this.pagination = page.getByRole('navigation', { name: /pagination/i });
  }

  async expectNotificationCount(count: number): Promise<void> {
    await expect(this.notificationItems).toHaveCount(count);
  }

  async filterByReadStatus(value: string): Promise<void> {
    await this.readFilter.selectOption(value);
  }

  async filterByChannel(value: string): Promise<void> {
    await this.channelFilter.selectOption(value);
  }
}
