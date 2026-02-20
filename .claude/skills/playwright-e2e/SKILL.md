---
name: playwright-e2e
description: Write, update, and debug Playwright E2E tests for Angular 21 standalone projects. Generates spec files, page objects, fixtures, helpers, and Playwright config using Page Object Model. Use this skill whenever the user mentions e2e tests, end-to-end testing, Playwright, writing integration tests, testing user flows, debugging failing e2e tests, or wants to test Angular components/pages in a browser. Also trigger when the user says "test this page", "write tests for this feature", "why is my e2e failing", or references any .spec.ts file in an e2e directory.
---

# Playwright E2E Skill for Angular 21

Write, update, and debug end-to-end tests for Angular 21 standalone applications using `@playwright/test` with Page Object Model.

## Reference Files

Read the relevant reference file BEFORE generating any code.

| File                             | When to Read                                     | Content                                             |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| `references/page-objects.md`     | Always (before writing any test)                 | POM structure, naming, base page class, selectors   |
| `references/angular-patterns.md` | When testing Angular-specific features           | Signals, @if/@for/@switch, defer, hydration, router |
| `references/fixtures-helpers.md` | When setting up project or writing complex tests | Custom fixtures, test helpers, API mocking, auth    |

## Workflow

### 1. Detect Project State

Before generating anything, check the project:

```bash
# Check if Playwright is installed
ls node_modules/@playwright/test 2>/dev/null

# Check for existing config
ls playwright.config.ts 2>/dev/null

# Check for existing e2e directory
ls -la e2e/ 2>/dev/null

# Check Angular version
cat package.json | grep "@angular/core"

# Check for existing page objects
find e2e -name "*.page.ts" 2>/dev/null

# Check for existing specs
find e2e -name "*.spec.ts" 2>/dev/null
```

### 2. Decide the Task

| User Intent                    | Action                                                |
| ------------------------------ | ----------------------------------------------------- |
| "Set up e2e" / no config found | Generate config + base structure (see Section 3)      |
| "Write tests for X"            | Read the target page/component, generate POM + spec   |
| "Update tests for X"           | Read existing spec + POM, modify in place             |
| "My test is failing" / debug   | Read the spec, run it, analyze output, fix            |
| "Add tests for new feature"    | Read existing POMs, extend or create new ones + specs |

### 3. Project Setup (only if no config exists)

Generate these files in order:

```
project-root/
├── playwright.config.ts
├── e2e/
│   ├── fixtures/
│   │   └── base.fixture.ts       # Custom test fixture with all page objects
│   ├── helpers/
│   │   ├── auth.helper.ts        # Authentication utilities
│   │   └── api-mock.helper.ts    # Route interception helpers
│   ├── pages/
│   │   ├── base.page.ts          # Abstract base page object
│   │   └── [feature].page.ts     # Feature-specific page objects
│   └── tests/
│       └── [feature].spec.ts     # Test specs organized by feature
```

#### Playwright Config Template

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
```

### 4. Writing Tests

Read `references/page-objects.md` first. Then follow this process:

1. **Identify the page/feature** the user wants tested
2. **Read the Angular component** source (template + class) to understand:
   - What elements are rendered and their selectors
   - What user interactions are possible
   - What signals/state drive conditional rendering
   - What API calls the component makes
3. **Check for existing POMs** in `e2e/pages/` that cover this feature
4. **Generate or update the page object** with locators and action methods
5. **Generate or update the spec** with descriptive test blocks

#### Test Structure Rules

- One spec file per feature/page (not per component)
- Group related tests in `test.describe()` blocks
- Use `test.beforeEach()` for navigation and common setup
- Each test should be independent and not rely on other test state
- Use meaningful test names that describe the user behavior: `test('should display error when submitting empty form')`
- Prefer user-visible selectors: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder` over CSS selectors
- Use `data-testid` only when semantic selectors are not viable
- Always add `await expect()` assertions, never fire-and-forget actions

#### Selector Priority (highest to lowest)

1. `page.getByRole('button', { name: 'Submit' })` - accessible role + name
2. `page.getByLabel('Email')` - form fields by label
3. `page.getByPlaceholder('Enter email')` - placeholder text
4. `page.getByText('Welcome')` - visible text content
5. `page.getByTestId('submit-btn')` - data-testid attribute (last resort)

### 5. Updating Existing Tests

When the user asks to update tests:

1. Read the existing spec file and its page object
2. Read the updated component source to see what changed
3. Update locators in the POM if selectors changed
4. Add/modify/remove test cases to match new behavior
5. Preserve existing test organization and naming patterns
6. Run the updated tests to verify they pass

### 6. Debugging Failing Tests

When the user reports a failing test:

1. **Run the failing test** with verbose output:
   ```bash
   npx playwright test [test-file] --reporter=list --headed 2>&1
   ```
2. **Read the error output** carefully. Common failure categories:
   - **Timeout**: Element not found or slow rendering. Check selectors and add proper waits.
   - **Assertion failed**: Expected vs actual mismatch. Check if component behavior changed.
   - **Navigation error**: Route not loading. Check if `webServer` is running and routes are correct.
   - **Stale locator**: Element detached from DOM. Angular re-renders may cause this with signals/@if.
3. **Check the trace** if available:
   ```bash
   npx playwright show-trace test-results/[test-name]/trace.zip
   ```
4. **Fix the root cause**, not the symptom. If a selector broke because the component changed, update the POM, not just the test.
5. **Re-run** to confirm the fix.

#### Angular-Specific Debugging

Read `references/angular-patterns.md` for debugging issues related to:

- Signal-driven re-renders causing timing issues
- `@defer` blocks not loading in test environment
- Route guards blocking navigation
- Hydration mismatches in SSR apps

### 7. Code Quality Checks

Before delivering any test code, verify:

- [ ] All locators use the selector priority order above
- [ ] No hardcoded waits (`page.waitForTimeout`) unless absolutely necessary
- [ ] Page objects expose actions and assertions, not raw locators
- [ ] Tests are independent (no shared mutable state)
- [ ] `test.describe` blocks group related scenarios
- [ ] Error paths are tested, not just happy paths
- [ ] Forms test validation messages
- [ ] Navigation tests verify URL changes
- [ ] API-dependent tests use route mocking

### 8. Running Tests

Provide the user with the appropriate command:

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test e2e/tests/[feature].spec.ts

# Run in headed mode (for debugging)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific test by title
npx playwright test -g "should display error"

# Generate report
npx playwright show-report
```
