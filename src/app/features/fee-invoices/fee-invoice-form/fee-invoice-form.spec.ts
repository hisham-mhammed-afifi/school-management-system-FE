import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeInvoiceFormComponent } from './fee-invoice-form';

describe('FeeInvoiceFormComponent', () => {
  let fixture: ComponentFixture<FeeInvoiceFormComponent>;
  let component: FeeInvoiceFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeInvoiceFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/fee-invoices/new');
    fixture = TestBed.createComponent(FeeInvoiceFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDropdowns(): void {
    httpTesting
      .expectOne((r) => r.url === '/api/v1/students')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/fee-structures')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDropdowns();
    expect(component).toBeTruthy();
    expect(component.items.length).toBe(1);
  });

  it('should add and remove items', () => {
    fixture.detectChanges();
    flushDropdowns();

    component.addItem();
    expect(component.items.length).toBe(2);

    component.removeItem(0);
    expect(component.items.length).toBe(1);
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    flushDropdowns();

    component.onSubmit();

    expect(component.saving()).toBe(false);
    httpTesting.expectNone('/api/v1/fee-invoices');
  });

  it('should submit valid form for creation', () => {
    fixture.detectChanges();
    flushDropdowns();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.form.patchValue({
      studentId: 's-1',
      dueDate: '2026-03-01',
    });
    component.items.at(0).patchValue({
      feeStructureId: 'fs-1',
      quantity: 1,
      unitAmount: 5000,
    });

    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/fee-invoices');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.studentId).toBe('s-1');
    expect(req.request.body.items[0].feeStructureId).toBe('fs-1');
    req.flush({ success: true, data: { id: 'inv-new' } });

    expect(navigateSpy).toHaveBeenCalledWith([
      '/schools',
      'test-school',
      'fee-invoices',
      'inv-new',
    ]);
  });
});
