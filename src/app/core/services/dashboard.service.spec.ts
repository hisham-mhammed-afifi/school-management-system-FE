import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch overview', () => {
    const mockData = {
      students: 120,
      teachers: 15,
      classSections: 8,
      attendanceToday: 92.5,
      fees: {
        outstanding: { amount: 5000, count: 10 },
        collected: { amount: 25000, count: 50 },
        overdue: { amount: 2000, count: 5 },
      },
    };

    service.overview().subscribe((res) => {
      expect(res.data).toEqual(mockData);
    });

    const req = httpTesting.expectOne('/api/v1/dashboard/overview');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockData });
  });

  it('should fetch attendance today', () => {
    service.attendanceToday().subscribe();

    const req = httpTesting.expectOne('/api/v1/dashboard/attendance-today');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should fetch attendance today with date param', () => {
    service.attendanceToday('2026-02-20').subscribe();

    const req = httpTesting.expectOne(
      (r) =>
        r.url === '/api/v1/dashboard/attendance-today' && r.params.get('date') === '2026-02-20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should fetch fees summary', () => {
    service.feesSummary().subscribe();

    const req = httpTesting.expectOne('/api/v1/dashboard/fees-summary');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        outstanding: { amount: 0, count: 0 },
        collected: { amount: 0, count: 0 },
        overdue: { amount: 0, count: 0 },
      },
    });
  });

  it('should fetch recent activity', () => {
    service.recentActivity().subscribe();

    const req = httpTesting.expectOne('/api/v1/dashboard/recent-activity');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should fetch platform overview', () => {
    service.platformOverview().subscribe();

    const req = httpTesting.expectOne('/api/v1/platform/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { schoolCount: 5, userCount: 200 } });
  });

  it('should fetch expiring schools', () => {
    service.expiringSchools().subscribe();

    const req = httpTesting.expectOne('/api/v1/platform/schools/expiring');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should fetch expiring schools with days param', () => {
    service.expiringSchools(60).subscribe();

    const req = httpTesting.expectOne(
      (r) => r.url === '/api/v1/platform/schools/expiring' && r.params.get('days') === '60',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
