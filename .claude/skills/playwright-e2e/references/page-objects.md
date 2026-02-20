# Page Object Model Reference

## Base Page Class

Every page object extends this base class. It provides shared utilities and enforces consistent patterns.

```typescript
// e2e/pages/base.page.ts
import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Override in subclass with the route path */
  abstract readonly path: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageReady();
  }

  /**
   * Override to define what "ready" means for this page.
   * Default: wait for Angular to stabilize (no pending HTTP/timers).
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Reusable: wait for a loading spinner to disappear */
  async waitForLoading(): Promise<void> {
    const spinner = this.page.getByRole('progressbar');
    await spinner.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {
      // spinner may never appear if data loads fast
    });
  }

  /** Reusable: get toast/snackbar notification text */
  async getNotificationText(): Promise<string> {
    const toast = this.page.getByRole('alert');
    await toast.waitFor({ state: 'visible' });
    return toast.innerText();
  }
}
```

## Page Object Structure

Each page object file follows this pattern:

```typescript
// e2e/pages/login.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly path = '/login';

  // --- Locators (readonly, defined once) ---
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  // --- Actions (user behaviors) ---
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  // --- Assertions (verify state) ---
  async expectErrorVisible(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectFormEmpty(): Promise<void> {
    await expect(this.emailInput).toHaveValue('');
    await expect(this.passwordInput).toHaveValue('');
  }
}
```

## Naming Conventions

| Item               | Pattern                        | Example                                           |
| ------------------ | ------------------------------ | ------------------------------------------------- |
| Page object file   | `[feature].page.ts`            | `login.page.ts`, `dashboard.page.ts`              |
| Page object class  | `[Feature]Page`                | `LoginPage`, `DashboardPage`                      |
| Spec file          | `[feature].spec.ts`            | `login.spec.ts`, `dashboard.spec.ts`              |
| Locator properties | camelCase, descriptive         | `emailInput`, `submitButton`, `errorMessage`      |
| Action methods     | verb-first, describes behavior | `login()`, `clickForgotPassword()`, `selectRow()` |
| Assertion methods  | `expect` prefix                | `expectErrorVisible()`, `expectRowCount()`        |

## Spec File Structure

```typescript
// e2e/tests/login.spec.ts
import { test, expect } from '../fixtures/base.fixture';

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test.describe('form validation', () => {
    test('should show error for empty email', async ({ loginPage }) => {
      await loginPage.login('', 'password123');
      await loginPage.expectErrorVisible('Email is required');
    });

    test('should show error for invalid email format', async ({ loginPage }) => {
      await loginPage.login('not-an-email', 'password123');
      await loginPage.expectErrorVisible('Invalid email');
    });
  });

  test.describe('authentication', () => {
    test('should redirect to dashboard on valid login', async ({ loginPage, page }) => {
      await loginPage.login('user@example.com', 'correctpassword');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should display error on invalid credentials', async ({ loginPage }) => {
      await loginPage.login('user@example.com', 'wrongpassword');
      await loginPage.expectErrorVisible('Invalid credentials');
    });
  });
});
```

## Complex Page Objects

For pages with multiple sections (tabs, dialogs, lists), compose smaller POMs:

```typescript
// e2e/pages/settings.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/** Represents the profile tab within settings */
class ProfileSection {
  readonly nameInput: Locator;
  readonly saveButton: Locator;

  constructor(
    private page: Page,
    private container: Locator,
  ) {
    this.nameInput = container.getByLabel('Display name');
    this.saveButton = container.getByRole('button', { name: 'Save' });
  }

  async updateName(name: string): Promise<void> {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    await this.saveButton.click();
  }
}

/** Represents a confirmation dialog */
class ConfirmDialog {
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(private dialog: Locator) {
    this.confirmButton = dialog.getByRole('button', { name: 'Confirm' });
    this.cancelButton = dialog.getByRole('button', { name: 'Cancel' });
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }
}

export class SettingsPage extends BasePage {
  readonly path = '/settings';
  readonly profile: ProfileSection;

  constructor(page: Page) {
    super(page);
    const profileTab = page.getByRole('tabpanel', { name: 'Profile' });
    this.profile = new ProfileSection(page, profileTab);
  }

  async openTab(name: string): Promise<void> {
    await this.page.getByRole('tab', { name }).click();
  }

  getConfirmDialog(): ConfirmDialog {
    return new ConfirmDialog(this.page.getByRole('dialog'));
  }
}
```

## Table/List Page Objects

For data tables and lists, expose row-level interactions:

```typescript
// e2e/pages/users-list.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class UsersListPage extends BasePage {
  readonly path = '/users';

  readonly table: Locator;
  readonly searchInput: Locator;
  readonly addUserButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.getByRole('table');
    this.searchInput = page.getByPlaceholder('Search users');
    this.addUserButton = page.getByRole('button', { name: 'Add user' });
  }

  /** Get all visible table rows (excluding header) */
  get rows(): Locator {
    return this.table.getByRole('row').filter({ hasNot: this.page.locator('th') });
  }

  /** Get a specific row by visible text content */
  getRowByText(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Wait for Angular signal/change detection to re-render the list
    await this.page.waitForTimeout(300); // debounce
  }

  async deleteUser(name: string): Promise<void> {
    const row = this.getRowByText(name);
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  async expectRowCount(count: number): Promise<void> {
    await expect(this.rows).toHaveCount(count);
  }
}
```

## Anti-Patterns to Avoid

**Do not expose raw locators without methods.**
Bad: `page.locator('.btn-submit')` used directly in tests.
Good: `loginPage.submitButton` defined once in the POM.

**Do not put assertions in action methods.**
Bad: `async login() { ... await expect(this.page).toHaveURL('/dashboard'); }`
Good: Separate `login()` (action) from `expectRedirected()` (assertion). A failed login also calls `login()` but expects an error instead.

**Do not use CSS class selectors as primary locators.**
Bad: `page.locator('.mat-mdc-button.primary')`
Good: `page.getByRole('button', { name: 'Submit' })`

**Do not chain page object methods.**
Bad: `await loginPage.fillEmail('x').fillPassword('y').submit()`
Good: Keep methods as standalone async calls. Chaining hides individual step failures.

**Do not duplicate locators across page objects.**
If a navbar appears on multiple pages, create a `NavbarComponent` POM and compose it into page objects that need it.
