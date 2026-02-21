import { type Page, type Route } from '@playwright/test';

interface MockOptions {
  status?: number;
  body?: unknown;
  delay?: number;
  headers?: Record<string, string>;
}

export class ApiMockHelper {
  constructor(private page: Page) {}

  /** Mock a GET endpoint */
  async mockGet(urlPattern: string, body: unknown, options?: MockOptions): Promise<void> {
    await this.page.route(urlPattern, async (route: Route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      if (options?.delay) {
        await new Promise((r) => setTimeout(r, options.delay));
      }
      await route.fulfill({
        status: options?.status ?? 200,
        contentType: 'application/json',
        headers: options?.headers,
        body: JSON.stringify(body),
      });
    });
  }

  /** Mock a POST endpoint */
  async mockPost(urlPattern: string, responseBody: unknown, options?: MockOptions): Promise<void> {
    await this.page.route(urlPattern, async (route: Route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      if (options?.delay) {
        await new Promise((r) => setTimeout(r, options.delay));
      }
      await route.fulfill({
        status: options?.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });
  }

  /** Mock a DELETE endpoint */
  async mockDelete(
    urlPattern: string,
    responseBody: unknown = { data: null },
    options?: MockOptions,
  ): Promise<void> {
    await this.page.route(urlPattern, async (route: Route) => {
      if (route.request().method() !== 'DELETE') {
        await route.fallback();
        return;
      }
      if (options?.delay) {
        await new Promise((r) => setTimeout(r, options.delay));
      }
      await route.fulfill({
        status: options?.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });
  }

  /** Mock an endpoint to return an error */
  async mockError(urlPattern: string, status = 500, message = 'Server Error'): Promise<void> {
    await this.page.route(urlPattern, (route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message } }),
      }),
    );
  }

  /** Mock an endpoint with a delayed response (simulate slow network) */
  async mockSlow(urlPattern: string, body: unknown, delayMs: number): Promise<void> {
    await this.mockGet(urlPattern, body, { delay: delayMs });
  }

  /** Remove all route mocks */
  async clearAll(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }
}
