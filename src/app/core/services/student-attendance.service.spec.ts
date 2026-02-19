import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentAttendanceService } from './student-attendance.service';

describe('StudentAttendanceService', () => {
  let service: StudentAttendanceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StudentAttendanceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list student attendance records', () => {
    service.list({ classSectionId: 'cs-1', date: '2026-02-19' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/student-attendance');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('classSectionId')).toBe('cs-1');
    expect(req.request.params.get('date')).toBe('2026-02-19');
    req.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it('should get a single attendance record', () => {
    service.get('att-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/student-attendance/att-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'att-1' } });
  });

  it('should bulk record attendance', () => {
    const data = {
      classSectionId: 'cs-1',
      date: '2026-02-19',
      records: [
        { studentId: 's-1', status: 'present' as const },
        { studentId: 's-2', status: 'absent' as const },
      ],
    };

    service.bulkRecord(data).subscribe();

    const req = httpTesting.expectOne('/api/v1/student-attendance/bulk');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true, data: [] });
  });

  it('should correct an attendance record', () => {
    service.correct('att-1', { status: 'excused', notes: 'Doctor note' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/student-attendance/att-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('excused');
    req.flush({ success: true, data: { id: 'att-1' } });
  });

  it('should get attendance summary', () => {
    service
      .summary({ classSectionId: 'cs-1', dateFrom: '2026-01-01', dateTo: '2026-02-19' })
      .subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/student-attendance/summary');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('classSectionId')).toBe('cs-1');
    expect(req.request.params.get('dateFrom')).toBe('2026-01-01');
    expect(req.request.params.get('dateTo')).toBe('2026-02-19');
    req.flush({ success: true, data: { students: [] } });
  });
});
