import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeInvoicesComponent } from './fee-invoices';

describe('FeeInvoicesComponent', () => {
  let fixture: ComponentFixture<FeeInvoicesComponent>;
  let component: FeeInvoicesComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeInvoicesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeeInvoicesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushList(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-invoices');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 20, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushList();
    expect(component).toBeTruthy();
  });

  it('should load fee invoices on init', () => {
    fixture.detectChanges();
    flushList([
      {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        studentId: 's-1',
        dueDate: '2026-03-01',
        netAmount: 5000,
        status: 'draft',
        student: { id: 's-1', firstName: 'John', lastName: 'Doe', studentCode: 'STU-001' },
      },
    ]);

    expect(component.invoices().length).toBe(1);
    expect(component.invoices()[0].invoiceNumber).toBe('INV-001');
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-invoices');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('FEE_INVOICES.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushList();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-invoices');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should return correct status class', () => {
    expect(component.statusClass('paid')).toContain('bg-success-bg');
    expect(component.statusClass('overdue')).toContain('bg-danger-bg');
    expect(component.statusClass('draft')).toContain('bg-bg-secondary');
  });
});
