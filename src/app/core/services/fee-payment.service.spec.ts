import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeePaymentService } from './fee-payment.service';

describe('FeePaymentService', () => {
  let service: FeePaymentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeePaymentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list fee payments', () => {
    service.list({ invoiceId: 'inv-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-payments');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('invoiceId')).toBe('inv-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a fee payment', () => {
    service.get('fp-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-payments/fp-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'fp-1', amountPaid: 5000 } });
  });

  it('should create a fee payment', () => {
    const body = {
      invoiceId: 'inv-1',
      amountPaid: 5000,
      paymentDate: '2026-02-19',
      paymentMethod: 'cash' as const,
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-payments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.amountPaid).toBe(5000);
    req.flush({ success: true, data: { id: 'fp-new', ...body } });
  });
});
