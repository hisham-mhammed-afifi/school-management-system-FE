import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AcademicYearService } from './academic-year.service';

describe('AcademicYearService', () => {
  let service: AcademicYearService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AcademicYearService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list academic years', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should filter by isActive', () => {
    service.list({ isActive: true }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    expect(req.request.params.get('isActive')).toBe('true');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });
});
