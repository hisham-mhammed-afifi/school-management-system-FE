# Angular 21 E2E Testing Patterns

## Testing Signal-Driven UI

Angular 21 uses signals for reactivity. Signals update the DOM synchronously during change detection, but the update may not be immediate from Playwright's perspective.

### Pattern: Wait for Signal-Driven Content

When a signal change triggers a re-render (e.g., a counter incrementing, a list filtering), the DOM updates during the next change detection cycle. Playwright's auto-waiting usually handles this, but for computed/derived signals with async data, explicitly wait for the expected state:

```typescript
// The component uses a signal: count = signal(0)
// Template: <span>{{ count() }}</span>
test('should increment counter', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment' }).click();
  // Playwright auto-waits for text to appear
  await expect(page.getByText('1')).toBeVisible();
});
```

### Pattern: Signal-Based Conditional Rendering

When `@if` depends on a signal, the element may not exist in the DOM until the signal changes.

```typescript
// Template: @if (isLoggedIn()) { <nav>...</nav> }
test('should show nav after login', async ({ page }) => {
  // Nav does not exist yet
  await expect(page.getByRole('navigation')).toBeHidden();

  await loginPage.login('user@test.com', 'pass');

  // Signal changes, @if renders the nav
  await expect(page.getByRole('navigation')).toBeVisible();
});
```

### Pattern: Effect-Driven Side Effects

When an `effect()` triggers an API call or DOM update after a signal changes, there may be a delay. Wait for the result, not a fixed timeout.

```typescript
// Component: effect(() => { this.loadData(this.searchQuery()); });
test('should load filtered results after search', async ({ page }) => {
  await page.getByPlaceholder('Search').fill('angular');

  // Wait for the API response to render, not a hardcoded timeout
  await expect(page.getByRole('listitem')).toHaveCount(5);
});
```

## Testing @if / @else

The new control flow syntax `@if` conditionally adds/removes elements from the DOM (not just hides them).

```typescript
// Template:
// @if (error()) {
//   <p class="error">{{ error() }}</p>
// } @else {
//   <p>All good!</p>
// }

test('should toggle between error and success states', async ({ page }) => {
  // Initial state: no error
  await expect(page.getByText('All good!')).toBeVisible();
  await expect(page.getByText(/error/i)).not.toBeVisible();

  // Trigger an error
  await page.getByRole('button', { name: 'Submit' }).click();

  // @if branch renders, @else branch is removed from DOM
  await expect(page.getByText('Validation failed')).toBeVisible();
  await expect(page.getByText('All good!')).not.toBeVisible();
});
```

## Testing @for with track

`@for` renders lists with a `track` expression. When the underlying signal array changes, Angular diffs using the track key and updates only changed items.

```typescript
// Template:
// @for (item of items(); track item.id) {
//   <li>{{ item.name }}</li>
// } @empty {
//   <p>No items found</p>
// }

test('should render list and handle empty state', async ({ page }) => {
  // With items
  await expect(page.getByRole('listitem')).toHaveCount(3);

  // Clear the list (e.g., filter with no results)
  await page.getByPlaceholder('Filter').fill('nonexistent');

  // @empty block renders
  await expect(page.getByText('No items found')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('should update list when item is added', async ({ page }) => {
  const initialCount = await page.getByRole('listitem').count();
  await page.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(initialCount + 1);
});
```

## Testing @switch

```typescript
// Template:
// @switch (status()) {
//   @case ('loading') { <spinner /> }
//   @case ('error') { <error-banner /> }
//   @case ('success') { <results /> }
//   @default { <empty-state /> }
// }

test('should transition through loading states', async ({ page }) => {
  await page.getByRole('button', { name: 'Load data' }).click();

  // Loading state
  await expect(page.getByRole('progressbar')).toBeVisible();

  // Success state (after API resolves)
  await expect(page.getByRole('progressbar')).not.toBeVisible();
  await expect(page.getByTestId('results')).toBeVisible();
});
```

## Testing @defer Blocks

`@defer` lazily loads parts of the template. In E2E tests, the deferred content loads based on its trigger condition.

### Defer Triggers and How to Test Them

| Trigger                    | How to Activate in Test                   |
| -------------------------- | ----------------------------------------- |
| `@defer (on viewport)`     | Scroll the element into view              |
| `@defer (on interaction)`  | Click/focus the trigger element           |
| `@defer (on hover)`        | Hover over the trigger element            |
| `@defer (on idle)`         | Wait for browser idle (usually automatic) |
| `@defer (on timer(500ms))` | Wait for the timer duration               |
| `@defer (when condition)`  | Trigger the condition                     |

```typescript
// Template:
// @defer (on viewport) {
//   <heavy-chart [data]="chartData()" />
// } @placeholder {
//   <div>Chart loading area</div>
// } @loading (minimum 300ms) {
//   <skeleton-loader />
// }

test('should lazy-load chart on scroll', async ({ page }) => {
  // Placeholder is visible initially
  await expect(page.getByText('Chart loading area')).toBeVisible();

  // Scroll to trigger viewport loading
  await page.getByText('Chart loading area').scrollIntoViewIfNeeded();

  // Loading state may flash briefly
  // Then the actual chart renders
  await expect(page.getByTestId('heavy-chart')).toBeVisible({ timeout: 10_000 });
});
```

### Defer with Interaction Trigger

```typescript
// @defer (on interaction) {
//   <comments-section />
// } @placeholder {
//   <button>Load comments</button>
// }

test('should load comments on click', async ({ page }) => {
  await page.getByRole('button', { name: 'Load comments' }).click();
  await expect(page.getByTestId('comments-section')).toBeVisible();
});
```

## Testing Angular Router

### Route Navigation

```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
```

### Route Guards

When a route guard redirects (e.g., auth guard), test the redirect behavior:

```typescript
test('should redirect to login when not authenticated', async ({ page }) => {
  await page.goto('/dashboard');
  // Auth guard redirects
  await expect(page).toHaveURL('/login');
});

test('should allow access when authenticated', async ({ page, authHelper }) => {
  await authHelper.loginAsUser();
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
});
```

### Route Parameters and Query Params

```typescript
test('should load user profile from route param', async ({ page }) => {
  await page.goto('/users/42');
  await expect(page.getByRole('heading')).toContainText('User #42');
});

test('should apply filters from query params', async ({ page }) => {
  await page.goto('/products?category=electronics&sort=price');
  await expect(page.getByText('Electronics')).toBeVisible();
  // Verify the filter UI reflects the query params
  await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue('electronics');
});
```

## Testing Forms (Reactive Forms with Signals)

Angular 21 forms may use signal-based form models or traditional reactive forms.

```typescript
test('should validate form and show errors', async ({ page }) => {
  const form = page.locator('form');

  // Submit empty form
  await page.getByRole('button', { name: 'Submit' }).click();

  // Validation errors appear
  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByText('Email is required')).toBeVisible();

  // Fill valid data
  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('john@example.com');

  // Errors clear as fields become valid
  await expect(page.getByText('Name is required')).not.toBeVisible();
  await expect(page.getByText('Email is required')).not.toBeVisible();
});
```

## Testing HttpClient Interceptors / Resource API

When components use `resource()` or `httpResource()` to fetch data, mock the API at the network level:

```typescript
test('should display data from API', async ({ page }) => {
  // Intercept the API call before navigation
  await page.route('**/api/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]),
    }),
  );

  await page.goto('/users');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('Alice')).toBeVisible();
});

test('should handle API error gracefully', async ({ page }) => {
  await page.route('**/api/users', (route) =>
    route.fulfill({ status: 500, body: 'Internal Server Error' }),
  );

  await page.goto('/users');
  await expect(page.getByText('Failed to load users')).toBeVisible();
});
```

## Common Timing Issues

### Problem: Test passes locally but fails in CI

CI machines are slower. Increase timeouts for specific assertions, not globally:

```typescript
// Instead of increasing global timeout
await expect(page.getByTestId('chart')).toBeVisible({ timeout: 15_000 });
```

### Problem: Signal updates not reflected

If a signal update does not immediately reflect in the DOM, Angular may need a change detection cycle. Playwright's auto-retry on `expect` assertions handles this in most cases. If not:

```typescript
// Force a tick by interacting with the page
await page.locator('body').click({ position: { x: 0, y: 0 } });
await expect(page.getByText('Updated value')).toBeVisible();
```

### Problem: @defer content not loading

Ensure the trigger condition is met. For `on viewport`, the element must actually be in the viewport:

```typescript
// Explicitly scroll
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await expect(page.getByTestId('deferred-content')).toBeVisible({ timeout: 10_000 });
```

### Problem: Route guard race condition

Navigation may complete before the guard resolves. Use `waitForURL`:

```typescript
await page.getByRole('link', { name: 'Dashboard' }).click();
await page.waitForURL('/dashboard');
```
