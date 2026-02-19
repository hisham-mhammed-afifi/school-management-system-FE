import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GradeService } from './grade.service';

describe('GradeService', () => {
  let service: GradeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GradeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list grades', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grades');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });
});
