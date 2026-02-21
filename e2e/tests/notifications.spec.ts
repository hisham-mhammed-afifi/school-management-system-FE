import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockNotification(
  id: string,
  title: string,
  body: string,
  opts: { isRead?: boolean; channel?: string } = {},
) {
  return {
    id,
    userId: 'u1',
    title,
    body,
    channel: opts.channel ?? 'in_app',
    isRead: opts.isRead ?? false,
    schoolId: SCHOOL_ID,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  };
}

function paginatedNotifications(
  data: unknown[],
  meta = { page: 1, limit: 20, total: data.length, totalPages: 1 },
) {
  return { success: true, data, meta };
}

test.describe('Notifications List', () => {
  test('should display notifications list with data', async ({
    page,
    apiMock,
    notificationsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications([
            mockNotification('n1', 'Welcome', 'Welcome to the platform'),
            mockNotification('n2', 'Update', 'A new update is available', { isRead: true }),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.heading).toBeVisible();
    await notificationsPage.expectNotificationCount(2);
  });

  test('should show empty state when no notifications', async ({
    page,
    apiMock,
    notificationsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/notifications*', paginatedNotifications([]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.heading).toBeVisible();
    await expect(notificationsPage.emptyState).toBeVisible();
  });

  test('should filter by read status', async ({ page, apiMock, notificationsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications([
            mockNotification('n1', 'Unread', 'Body'),
            mockNotification('n2', 'Read', 'Body', { isRead: true }),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications') && req.url().includes('isRead=false'),
    );
    await notificationsPage.filterByReadStatus('false');
    await requestPromise;
  });

  test('should filter by channel', async ({ page, apiMock, notificationsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications([mockNotification('n1', 'Test', 'Body')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications') && req.url().includes('channel=in_app'),
    );
    await notificationsPage.filterByChannel('in_app');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, notificationsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/notifications*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.errorAlert).toBeVisible();
  });

  test('should mark all as read', async ({ page, apiMock, notificationsPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications([
            mockNotification('n1', 'Unread 1', 'Body'),
            mockNotification('n2', 'Unread 2', 'Body'),
          ]),
        );
        await mock.mockPost('**/api/v1/notifications/read-all', {
          success: true,
          data: { message: 'All notifications marked as read' },
        });
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications/read-all') && req.method() === 'POST',
    );
    await notificationsPage.markAllReadButton.click();
    await requestPromise;
  });

  test('should show send button when user has notifications.create permission', async ({
    page,
    apiMock,
    notificationsPage,
  }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet('**/api/v1/notifications*', paginatedNotifications([]));
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.sendButton).toBeVisible();
  });

  test('should display pagination for large lists', async ({
    page,
    apiMock,
    notificationsPage,
  }) => {
    const notifications = Array.from({ length: 20 }, (_, i) =>
      mockNotification(`n${i + 1}`, `Notification ${i + 1}`, 'Body'),
    );
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications(notifications, { page: 1, limit: 20, total: 50, totalPages: 3 }),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.pagination).toBeVisible();
  });

  test('should navigate to next page', async ({ page, apiMock, notificationsPage }) => {
    const notifications = Array.from({ length: 20 }, (_, i) =>
      mockNotification(`n${i + 1}`, `Notification ${i + 1}`, 'Body'),
    );
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/notifications*',
          paginatedNotifications(notifications, { page: 1, limit: 20, total: 50, totalPages: 3 }),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/notifications`);
    await expect(notificationsPage.pagination).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/notifications') && req.url().includes('page=2'),
    );
    await page.getByRole('button', { name: /next/i }).click();
    await requestPromise;
  });
});
