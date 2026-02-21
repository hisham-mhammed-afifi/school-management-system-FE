import { test, expect } from '../fixtures/base.fixture';
import { setupAuthenticated } from '../helpers/auth-setup.helper';

const SCHOOL_ID = 'test-school-1';

function mockInvoice(id: string, invoiceNumber: string, status: string, netAmount = 1000) {
  return {
    id,
    invoiceNumber,
    student: { id: `stu-${id}`, firstName: 'Ahmed', lastName: 'Ali' },
    dueDate: '2025-03-15',
    netAmount,
    paidAmount: status === 'paid' ? netAmount : 0,
    status,
    schoolId: SCHOOL_ID,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };
}

function paginatedInvoices(
  invoices: unknown[],
  meta = { page: 1, limit: 10, total: invoices.length, totalPages: 1 },
) {
  return { data: invoices, meta };
}

test.describe('Fee Invoices List', () => {
  test('should display fee invoices list with data', async ({ page, apiMock, feeInvoicesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-invoices*',
          paginatedInvoices([
            mockInvoice('fi1', 'INV-001', 'draft'),
            mockInvoice('fi2', 'INV-002', 'paid'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-invoices`);
    await expect(feeInvoicesPage.heading).toBeVisible();
    await feeInvoicesPage.expectInvoiceCount(2);
  });

  test('should show correct status badge colors', async ({ page, apiMock, feeInvoicesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-invoices*',
          paginatedInvoices([
            mockInvoice('fi1', 'INV-001', 'paid'),
            mockInvoice('fi2', 'INV-002', 'overdue'),
          ]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-invoices`);
    await expect(feeInvoicesPage.heading).toBeVisible();
    await expect(page.locator('tbody .bg-success-bg').first()).toBeVisible();
    await expect(page.locator('tbody .bg-danger-bg').first()).toBeVisible();
  });

  test('should filter by status', async ({ page, apiMock, feeInvoicesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockGet(
          '**/api/v1/fee-invoices*',
          paginatedInvoices([mockInvoice('fi1', 'INV-001', 'draft')]),
        );
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-invoices`);
    await expect(feeInvoicesPage.heading).toBeVisible();

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/fee-invoices') && req.url().includes('status=draft'),
    );
    await feeInvoicesPage.statusFilter.selectOption('draft');
    await requestPromise;
  });

  test('should show error state on API failure', async ({ page, apiMock, feeInvoicesPage }) => {
    await setupAuthenticated(page, apiMock, {
      extraMocks: async (mock) => {
        await mock.mockError('**/api/v1/fee-invoices*', 500, 'Server Error');
      },
    });

    await page.goto(`/schools/${SCHOOL_ID}/fee-invoices`);
    await expect(feeInvoicesPage.errorAlert).toBeVisible();
  });
});
