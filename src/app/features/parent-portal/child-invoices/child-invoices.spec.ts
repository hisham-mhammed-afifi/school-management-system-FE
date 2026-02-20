import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ChildInvoicesComponent } from './child-invoices';

describe('ChildInvoicesComponent', () => {
  let fixture: ComponentFixture<ChildInvoicesComponent>;
  let component: ChildInvoicesComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    const paramMap = new Map<string, string>();
    paramMap.set('studentId', 's-1');

    await TestBed.configureTestingModule({
      imports: [ChildInvoicesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap } } },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/parent-portal/s-1/invoices');
    fixture = TestBed.createComponent(ChildInvoicesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInvoices(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/invoices');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInvoices();
    expect(component).toBeTruthy();
  });

  it('should load invoices on init', () => {
    fixture.detectChanges();
    flushInvoices([
      {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        dueDate: '2026-03-01',
        netAmount: 5000,
        paidAmount: 2000,
        status: 'partially_paid',
      },
    ]);

    expect(component.invoices().length).toBe(1);
    expect(component.invoices()[0].invoiceNumber).toBe('INV-001');
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/invoices');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(component.error()).toBe('PARENT_PORTAL.LOAD_INVOICES_ERROR');
  });

  it('should return correct status class', () => {
    expect(component.statusClass('paid')).toContain('bg-success-bg');
    expect(component.statusClass('overdue')).toContain('bg-danger-bg');
    expect(component.statusClass('issued')).toContain('bg-info-bg');
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushInvoices();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/invoices');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });
});
