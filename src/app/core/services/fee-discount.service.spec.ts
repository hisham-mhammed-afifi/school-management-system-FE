import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeeDiscountService } from './fee-discount.service';

describe('FeeDiscountService', () => {
  let service: FeeDiscountService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeeDiscountService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list fee discounts', () => {
    service.list({ feeStructureId: 'fs-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-discounts');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('feeStructureId')).toBe('fs-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should create a fee discount', () => {
    const body = {
      studentId: 's-1',
      feeStructureId: 'fs-1',
      discountType: 'percentage' as const,
      amount: 10,
      reason: 'Scholarship',
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-discounts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.discountType).toBe('percentage');
    req.flush({ success: true, data: { id: 'fd-1', ...body } });
  });

  it('should update a fee discount', () => {
    service.update('fd-1', { amount: 20 }).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-discounts/fd-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'fd-1', amount: 20 } });
  });

  it('should delete a fee discount', () => {
    service.delete('fd-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-discounts/fd-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
