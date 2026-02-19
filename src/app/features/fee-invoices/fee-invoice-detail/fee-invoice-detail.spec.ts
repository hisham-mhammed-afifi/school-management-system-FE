import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeInvoiceDetailComponent } from './fee-invoice-detail';

describe('FeeInvoiceDetailComponent', () => {
  let fixture: ComponentFixture<FeeInvoiceDetailComponent>;
  let component: FeeInvoiceDetailComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeInvoiceDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: FeeInvoiceDetailComponent }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeeInvoiceDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDetail(overrides: Record<string, unknown> = {}): void {
    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/fee-invoices/'));
    req.flush({
      success: true,
      data: {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        schoolId: 's-1',
        studentId: 's-1',
        dueDate: '2026-03-01',
        totalAmount: 5000,
        totalDiscountAmount: 500,
        netAmount: 4500,
        paidAmount: 0,
        status: 'draft',
        cancelReason: null,
        createdAt: '',
        updatedAt: '',
        student: { id: 's-1', firstName: 'John', lastName: 'Doe', studentCode: 'STU-001' },
        items: [
          {
            id: 'item-1',
            feeStructureId: 'fs-1',
            description: null,
            quantity: 1,
            unitAmount: 5000,
            totalAmount: 5000,
            feeStructure: { id: 'fs-1', name: 'Tuition Fee' },
          },
        ],
        ...overrides,
      },
    });
  }

  function flushPayments(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-payments');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDetail();
    flushPayments();
    expect(component).toBeTruthy();
  });

  it('should load invoice details', () => {
    fixture.detectChanges();
    flushDetail();
    flushPayments();

    expect(component.invoice()?.invoiceNumber).toBe('INV-001');
    expect(component.invoice()?.netAmount).toBe(4500);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/fee-invoices/'));
    req.flush(null, { status: 404, statusText: 'Not Found' });
    flushPayments();

    expect(component.error()).toBe('FEE_INVOICES.LOAD_ERROR');
  });

  it('should toggle issue modal', () => {
    fixture.detectChanges();
    flushDetail();
    flushPayments();

    component.openIssueModal();
    expect(component.showIssueModal()).toBe(true);

    component.closeIssueModal();
    expect(component.showIssueModal()).toBe(false);
  });

  it('should toggle cancel modal', () => {
    fixture.detectChanges();
    flushDetail();
    flushPayments();

    component.openCancelModal();
    expect(component.showCancelModal()).toBe(true);

    component.closeCancelModal();
    expect(component.showCancelModal()).toBe(false);
  });

  it('should return correct status class', () => {
    expect(component.statusClass('paid')).toContain('bg-success-bg');
    expect(component.statusClass('overdue')).toContain('bg-danger-bg');
  });
});
