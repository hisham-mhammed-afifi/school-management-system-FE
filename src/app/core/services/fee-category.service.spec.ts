import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeeCategoryService } from './fee-category.service';

describe('FeeCategoryService', () => {
  let service: FeeCategoryService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeeCategoryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list fee categories', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-categories');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should create a fee category', () => {
    service.create({ name: 'Tuition' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Tuition');
    req.flush({ success: true, data: { id: 'fc-1', name: 'Tuition' } });
  });

  it('should update a fee category', () => {
    service.update('fc-1', { name: 'Updated' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-categories/fc-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'fc-1', name: 'Updated' } });
  });

  it('should delete a fee category', () => {
    service.delete('fc-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-categories/fc-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
