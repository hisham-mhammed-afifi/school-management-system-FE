import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GradingScaleService } from './grading-scale.service';

describe('GradingScaleService', () => {
  let service: GradingScaleService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GradingScaleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list grading scales', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grading-scales');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a grading scale', () => {
    service.get('gs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/grading-scales/gs-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'gs-1', name: 'Default', levels: [] } });
  });

  it('should create a grading scale', () => {
    const body = {
      name: 'Standard',
      levels: [{ letter: 'A', minScore: 90, maxScore: 100, orderIndex: 1 }],
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/grading-scales');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Standard');
    req.flush({ success: true, data: { id: 'gs-new', ...body } });
  });

  it('should update a grading scale', () => {
    service.update('gs-1', { name: 'Updated' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/grading-scales/gs-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.name).toBe('Updated');
    req.flush({ success: true, data: { id: 'gs-1', name: 'Updated' } });
  });

  it('should delete a grading scale', () => {
    service.delete('gs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/grading-scales/gs-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
