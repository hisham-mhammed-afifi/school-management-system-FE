import { test, expect } from '../fixtures/base.fixture';

/** Mock UserProfile matching the shape from GET /api/v1/auth/me */
function mockUserProfile(schools: { id: string; name: string }[]) {
  return {
    data: {
      id: 'u1',
      email: 'user@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: schools.map((s, i) => ({
        roleId: `r${i + 1}`,
        roleName: 'Admin',
        schoolId: s.id,
        schoolName: s.name,
      })),
      permissions: ['dashboard.read', 'users.list', 'students.list', 'teachers.list'],
    },
  };
}

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should display login form', async ({ loginPage }) => {
    await loginPage.expectVisible();
    await loginPage.expectFormEmpty();
    await loginPage.expectSubmitEnabled();
  });

  test('should have email and password fields', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test.describe('form validation', () => {
    test('should show validation error for empty fields on submit', async ({ loginPage }) => {
      await loginPage.submitButton.click();
      await expect(loginPage.page.getByText('This field is required').first()).toBeVisible();
    });

    test('should show error for invalid email format', async ({ loginPage }) => {
      await loginPage.emailInput.fill('not-an-email');
      await loginPage.passwordInput.click(); // trigger blur
      await expect(loginPage.page.getByText('Please enter a valid email')).toBeVisible();
    });
  });

  test.describe('authentication', () => {
    test('should show error on invalid credentials', async ({ loginPage, apiMock }) => {
      await apiMock.mockPost(
        '**/api/v1/auth/login',
        { error: { message: 'Invalid email or password' } },
        { status: 401 },
      );

      await loginPage.login('wrong@example.com', 'wrongpassword');
      await loginPage.expectErrorVisible('Invalid email or password');
    });

    test('should show loading state during login', async ({ loginPage, apiMock }) => {
      // Mock POST with a long delay so loading state is visible
      await apiMock.mockPost(
        '**/api/v1/auth/login',
        { data: { accessToken: 'fake', refreshToken: 'fake' } },
        { delay: 5000 },
      );

      // Also mock /auth/me to prevent real backend call after login resolves
      await apiMock.mockGet('**/api/v1/auth/me', mockUserProfile([{ id: 's1', name: 'School' }]));

      await loginPage.emailInput.fill('user@test.com');
      await loginPage.passwordInput.fill('password');
      await loginPage.submitButton.click();

      await loginPage.expectLoadingState();
    });

    test('should redirect to school picker on login with multiple schools', async ({
      loginPage,
      apiMock,
      page,
    }) => {
      await apiMock.mockPost('**/api/v1/auth/login', {
        data: { accessToken: 'fake-token', refreshToken: 'fake-refresh' },
      });

      await apiMock.mockGet(
        '**/api/v1/auth/me',
        mockUserProfile([
          { id: 's1', name: 'School A' },
          { id: 's2', name: 'School B' },
        ]),
      );

      await loginPage.login('user@test.com', 'password');
      await expect(page).toHaveURL('/schools');
    });

    test('should redirect to dashboard on login with single school', async ({
      loginPage,
      apiMock,
      page,
    }) => {
      // Catch-all prevents unmocked dashboard API calls from hitting real backend (401 → redirect)
      await page.route('**/api/v1/**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        }),
      );

      await apiMock.mockPost('**/api/v1/auth/login', {
        data: { accessToken: 'fake-token', refreshToken: 'fake-refresh' },
      });

      await apiMock.mockGet(
        '**/api/v1/auth/me',
        mockUserProfile([{ id: 'school-1', name: 'My School' }]),
      );

      await loginPage.login('user@test.com', 'password');
      await expect(page).toHaveURL(/\/schools\/school-1\/dashboard/);
    });
  });
});
