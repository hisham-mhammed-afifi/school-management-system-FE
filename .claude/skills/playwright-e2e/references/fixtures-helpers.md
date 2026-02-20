# Custom Fixtures & Helpers Reference

## Base Test Fixture

The fixture file extends Playwright's `test` with pre-instantiated page objects, so specs never call `new` directly.

```typescript
// e2e/fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

// Define the fixture types
type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

### Adding New Page Objects to Fixtures

When creating a new page object, always register it in the fixture:

1. Import the page class
2. Add it to the `AppFixtures` type
3. Add the fixture initializer
4. Specs can now destructure it: `test('...', async ({ newPage }) => {})`

### Composed Fixtures

For tests that need authentication or pre-seeded data, create higher-level fixtures:

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from './base.fixture';

type AuthFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: [
    async ({ page }, use) => {
      // Set auth token via storage state or API call
      await page.goto('/login');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('testpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL('/dashboard');

      await use();
    },
    { auto: true },
  ], // auto: true means this runs for every test using this fixture
});

export { expect } from '@playwright/test';
```

### Storage State for Authentication

For faster auth, save and reuse browser storage state:

```typescript
// e2e/fixtures/auth-setup.ts
import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('testpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Save auth state
  await page.context().storageState({ path: authFile });
});
```

Then reference in `playwright.config.ts`:

```typescript
projects: [
  { name: 'setup', testMatch: /auth-setup\.ts/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/user.json',
    },
  },
],
```

## Auth Helper

Utility for handling authentication in tests without going through the UI every time.

```typescript
// e2e/helpers/auth.helper.ts
import { type Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /** Login via API (faster than UI login) */
  async loginViaApi(email: string, password: string): Promise<void> {
    const response = await this.page.request.post('/api/auth/login', {
      data: { email, password },
    });

    const { token } = await response.json();

    // Set the token in localStorage or cookie
    await this.page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
    }, token);
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
      localStorage.removeItem('auth_token');
    });
  }
}
```

Register in fixtures:

```typescript
// Add to base.fixture.ts
import { AuthHelper } from '../helpers/auth.helper';

type AppFixtures = {
  authHelper: AuthHelper;
  // ...other fixtures
};

export const test = base.extend<AppFixtures>({
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },
});
```

## API Mock Helper

Centralized route mocking for consistent API stubs across tests.

```typescript
// e2e/helpers/api-mock.helper.ts
import { type Page, type Route } from '@playwright/test';

type MockOptions = {
  status?: number;
  body?: unknown;
  delay?: number;
  headers?: Record<string, string>;
};

export class ApiMockHelper {
  private mocks: Array<() => Promise<void>> = [];

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

  /** Mock an endpoint to return an error */
  async mockError(urlPattern: string, status = 500, message = 'Server Error'): Promise<void> {
    await this.page.route(urlPattern, (route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: message }),
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
```

Register in fixtures:

```typescript
import { ApiMockHelper } from '../helpers/api-mock.helper';

// Add to AppFixtures type and fixture definition
apiMock: async ({ page }, use) => {
  const mock = new ApiMockHelper(page);
  await use(mock);
  await mock.clearAll(); // cleanup after each test
},
```

Usage in tests:

```typescript
test('should show loading state while API is slow', async ({ page, apiMock, usersPage }) => {
  await apiMock.mockSlow('**/api/users', [{ id: 1, name: 'Alice' }], 3000);
  await usersPage.navigate();

  // Loading indicator should appear
  await expect(page.getByRole('progressbar')).toBeVisible();

  // Then data appears
  await expect(page.getByText('Alice')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('progressbar')).not.toBeVisible();
});

test('should handle 404 error', async ({ apiMock, usersPage }) => {
  await apiMock.mockError('**/api/users', 404, 'Not found');
  await usersPage.navigate();
  await usersPage.expectErrorVisible('Not found');
});
```

## Test Data Helpers

For creating consistent test data across tests:

```typescript
// e2e/helpers/test-data.helper.ts

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    role: 'user',
    ...overrides,
  };
}

export function createTestUsers(count: number): TestUser[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUser({ id: i + 1, name: `User ${i + 1}` }),
  );
}

interface TestUser {
  id: number;
  name: string;
  email: string;
  role: string;
}
```

## Accessibility Testing Helper

Integrate axe-core for accessibility checks within E2E tests:

```typescript
// e2e/helpers/a11y.helper.ts
import { type Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class A11yHelper {
  constructor(private page: Page) {}

  /** Run accessibility scan and assert no violations */
  async expectNoViolations(options?: { exclude?: string[] }): Promise<void> {
    let builder = new AxeBuilder({ page: this.page });

    if (options?.exclude) {
      for (const selector of options.exclude) {
        builder = builder.exclude(selector);
      }
    }

    const results = await builder.analyze();
    expect(results.violations).toEqual([]);
  }

  /** Run scan and return violations for custom assertions */
  async getViolations() {
    const results = await new AxeBuilder({ page: this.page }).analyze();
    return results.violations;
  }
}
```

Usage:

```typescript
test('login page should have no accessibility violations', async ({ loginPage, page }) => {
  await loginPage.navigate();
  const a11y = new A11yHelper(page);
  await a11y.expectNoViolations();
});
```

## Fixture Composition Example

A complete fixture file for a real project:

```typescript
// e2e/fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { SettingsPage } from '../pages/settings.page';
import { UsersListPage } from '../pages/users-list.page';
import { AuthHelper } from '../helpers/auth.helper';
import { ApiMockHelper } from '../helpers/api-mock.helper';
import { A11yHelper } from '../helpers/a11y.helper';

type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  settingsPage: SettingsPage;
  usersListPage: UsersListPage;
  authHelper: AuthHelper;
  apiMock: ApiMockHelper;
  a11y: A11yHelper;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  usersListPage: async ({ page }, use) => {
    await use(new UsersListPage(page));
  },
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },
  apiMock: async ({ page }, use) => {
    const mock = new ApiMockHelper(page);
    await use(mock);
    await mock.clearAll();
  },
  a11y: async ({ page }, use) => {
    await use(new A11yHelper(page));
  },
});

export { expect } from '@playwright/test';
```
