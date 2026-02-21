import { type Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /** Login via API (faster than UI login) */
  async loginViaApi(email: string, password: string): Promise<void> {
    const response = await this.page.request.post('/api/v1/auth/login', {
      data: { email, password },
    });

    const body = await response.json();
    const { accessToken, refreshToken } = body.data;

    await this.page.evaluate(
      ({ access, refresh }) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      },
      { access: accessToken, refresh: refreshToken },
    );
  }

  /** Login as a default test user */
  async loginAsUser(): Promise<void> {
    await this.loginViaApi('user@test.com', 'testpassword');
  }

  /** Login as admin */
  async loginAsAdmin(): Promise<void> {
    await this.loginViaApi('admin@test.com', 'adminpassword');
  }

  /** Clear auth state */
  async logout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
  }
}
