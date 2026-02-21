import { type Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly path: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForLoading(): Promise<void> {
    const spinner = this.page.getByRole('progressbar');
    await spinner.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {
      // spinner may never appear if data loads fast
    });
  }

  async getNotificationText(): Promise<string> {
    const toast = this.page.getByRole('alert');
    await toast.waitFor({ state: 'visible' });
    return toast.innerText();
  }
}
