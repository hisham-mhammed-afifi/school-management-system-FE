import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

const mockUsersResponse = {
  success: true,
  data: [
    {
      id: 'u1',
      email: 'admin@test.com',
      phone: null,
      isActive: true,
      roles: [],
      lastLoginAt: null,
    },
    {
      id: 'u2',
      email: 'teacher@test.com',
      phone: null,
      isActive: true,
      roles: [],
      lastLoginAt: null,
    },
    {
      id: 'u3',
      email: 'parent@test.com',
      phone: null,
      isActive: true,
      roles: [],
      lastLoginAt: null,
    },
  ],
  meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
};

test.describe('Send Notification', () => {
  test('should display the form with user list', async ({
    page,
    apiMock,
    sendNotificationPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();
    await expect(sendNotificationPage.titleInput).toBeVisible();
    await expect(sendNotificationPage.bodyInput).toBeVisible();
    await sendNotificationPage.expectUserCount(3);
  });

  test('should show validation errors when submitting empty form', async ({
    page,
    apiMock,
    sendNotificationPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    await sendNotificationPage.submitButton.click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should show error when no users selected', async ({
    page,
    apiMock,
    sendNotificationPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    await sendNotificationPage.fillForm('Test Title', 'Test Body');
    await sendNotificationPage.submitButton.click();
    await expect(sendNotificationPage.errorAlert).toBeVisible();
  });

  test('should submit notification successfully', async ({
    page,
    apiMock,
    sendNotificationPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
        await mock.mockPost('**/api/v1/notifications/send', {
          success: true,
          data: { message: 'Notifications sent' },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    await sendNotificationPage.fillForm('Test Notification', 'This is a test notification body');
    await sendNotificationPage.selectUser(0);
    await sendNotificationPage.selectUser(1);

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications/send') && req.method() === 'POST',
    );
    await sendNotificationPage.submitButton.click();
    const request = await requestPromise;

    const body = request.postDataJSON();
    expect(body.title).toBe('Test Notification');
    expect(body.body).toBe('This is a test notification body');
    expect(body.userIds).toHaveLength(2);
    expect(body.channels).toContain('in_app');
  });

  test('should toggle channel selection', async ({ page, apiMock, sendNotificationPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    // in_app is selected by default — click email to add it
    await sendNotificationPage.toggleChannel('email');

    // Verify both selected by submitting
    await sendNotificationPage.fillForm('Test', 'Body');
    await sendNotificationPage.selectUser(0);

    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
        await mock.mockPost('**/api/v1/notifications/send', {
          success: true,
          data: { message: 'Sent' },
        });
      },
    });

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications/send') && req.method() === 'POST',
    );
    await sendNotificationPage.submitButton.click();
    const request = await requestPromise;

    const body = request.postDataJSON();
    expect(body.channels).toContain('in_app');
    expect(body.channels).toContain('email');
  });

  test('should navigate back when clicking back link', async ({
    page,
    apiMock,
    sendNotificationPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
        await mock.mockGet('**/api/v1/notifications*', {
          success: true,
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    await sendNotificationPage.backLink.click();
    await expect(page).toHaveURL(new RegExp(`/schools/${SCHOOL_ID}/notifications$`));
  });

  test('should handle send error', async ({ page, apiMock, sendNotificationPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/users*', mockUsersResponse);
        await mock.mockPost(
          '**/api/v1/notifications/send',
          {
            success: false,
            error: { code: 'ERROR', message: 'Failed to send' },
          },
          { status: 500 },
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications/send`);
    await expect(sendNotificationPage.heading).toBeVisible();

    await sendNotificationPage.fillForm('Test', 'Body');
    await sendNotificationPage.selectUser(0);
    await sendNotificationPage.submitButton.click();

    await expect(sendNotificationPage.errorAlert).toBeVisible();
  });
});
