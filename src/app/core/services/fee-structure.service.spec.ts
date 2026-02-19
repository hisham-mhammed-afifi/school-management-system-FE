import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeeStructureService } from './fee-structure.service';

describe('FeeStructureService', () => {
  let service: FeeStructureService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeeStructureService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list fee structures with filters', () => {
    service.list({ page: 1, limit: 20, gradeId: 'g-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-structures');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('gradeId')).toBe('g-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a fee structure', () => {
    service.get('fs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-structures/fs-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'fs-1', name: 'Tuition Fee' } });
  });

  it('should create a fee structure', () => {
    const body = {
      academicYearId: 'ay-1',
      gradeId: 'g-1',
      feeCategoryId: 'fc-1',
      name: 'Tuition Fee',
      amount: 5000,
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-structures');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Tuition Fee');
    req.flush({ success: true, data: { id: 'fs-new', ...body } });
  });

  it('should update a fee structure', () => {
    service.update('fs-1', { name: 'Updated Fee', amount: 6000 }).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-structures/fs-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'fs-1', name: 'Updated Fee' } });
  });

  it('should delete a fee structure', () => {
    service.delete('fs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-structures/fs-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
