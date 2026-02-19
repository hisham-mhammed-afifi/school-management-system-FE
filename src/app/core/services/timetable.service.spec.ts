import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TimetableService } from './timetable.service';

describe('TimetableService', () => {
  let service: TimetableService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TimetableService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list period sets', () => {
    service.listPeriodSets({ academicYearId: 'year-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/period-sets');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('academicYearId')).toBe('year-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get periods for a period set', () => {
    service.getPeriods('ps-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/period-sets/ps-1/periods');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should get working days for a period set', () => {
    service.getWorkingDays('ps-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/period-sets/ps-1/working-days');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should get class timetable', () => {
    service.getClassTimetable('cs-1', 'term-1').subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/timetable/class/cs-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('term-1');
    req.flush({
      success: true,
      data: { termId: 'term-1', classSectionId: 'cs-1', classSectionName: 'A', grid: {} },
    });
  });

  it('should get teacher timetable', () => {
    service.getTeacherTimetable('t-1', 'term-1').subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/timetable/teacher/t-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('term-1');
    req.flush({
      success: true,
      data: { termId: 'term-1', teacherId: 't-1', teacherName: 'Test', grid: {} },
    });
  });

  it('should get room timetable', () => {
    service.getRoomTimetable('r-1', 'term-1').subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/timetable/room/r-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('term-1');
    req.flush({
      success: true,
      data: { termId: 'term-1', roomId: 'r-1', roomName: 'Room 1', grid: {} },
    });
  });
});
