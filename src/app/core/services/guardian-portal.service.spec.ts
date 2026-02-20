import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GuardianPortalService } from './guardian-portal.service';

describe('GuardianPortalService', () => {
  let service: GuardianPortalService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GuardianPortalService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list children', () => {
    service.listChildren().subscribe();

    const req = httpTesting.expectOne('/api/v1/my/children');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list child grades with query params', () => {
    service.listChildGrades('s-1', { page: 1, limit: 20, termId: 't-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/grades');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('t-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list child attendance with date filters', () => {
    service.listChildAttendance('s-1', { from: '2026-01-01', to: '2026-01-31' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/attendance');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe('2026-01-01');
    expect(req.request.params.get('to')).toBe('2026-01-31');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list child report cards', () => {
    service.listChildReportCards('s-1', { page: 1 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/report-cards');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list child invoices', () => {
    service.listChildInvoices('s-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/my/children/s-1/invoices');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });
});
