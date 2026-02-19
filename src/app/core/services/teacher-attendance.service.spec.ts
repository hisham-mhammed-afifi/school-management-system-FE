import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherAttendanceService } from './teacher-attendance.service';

describe('TeacherAttendanceService', () => {
  let service: TeacherAttendanceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TeacherAttendanceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list teacher attendance records', () => {
    service.list({ date: '2026-02-19', status: 'present' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teacher-attendance');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('date')).toBe('2026-02-19');
    expect(req.request.params.get('status')).toBe('present');
    req.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it('should get a single teacher attendance record', () => {
    service.get('ta-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/teacher-attendance/ta-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'ta-1' } });
  });

  it('should record teacher attendance', () => {
    const data = {
      teacherId: 't-1',
      date: '2026-02-19',
      status: 'present' as const,
      checkIn: '08:00',
    };

    service.record(data).subscribe();

    const req = httpTesting.expectOne('/api/v1/teacher-attendance');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ success: true, data: { id: 'ta-1' } });
  });

  it('should correct teacher attendance', () => {
    service.correct('ta-1', { status: 'late', checkIn: '08:30' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/teacher-attendance/ta-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('late');
    req.flush({ success: true, data: { id: 'ta-1' } });
  });
});
