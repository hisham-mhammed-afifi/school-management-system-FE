import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EnrollmentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list enrollments', () => {
    service.list({ classSectionId: 'cs-1', status: 'active' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/enrollments');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('classSectionId')).toBe('cs-1');
    expect(req.request.params.get('status')).toBe('active');
    req.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });
});
