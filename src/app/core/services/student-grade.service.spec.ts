import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentGradeService } from './student-grade.service';

describe('StudentGradeService', () => {
  let service: StudentGradeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StudentGradeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list student grades', () => {
    service.list({ examSubjectId: 'es-1', page: 1, limit: 50 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/student-grades');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('examSubjectId')).toBe('es-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should bulk record grades', () => {
    const body = {
      examSubjectId: 'es-1',
      grades: [{ studentId: 'st-1', score: 85 }],
    };
    service.bulkRecord(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/student-grades/bulk');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.examSubjectId).toBe('es-1');
    req.flush({ success: true, data: [{ id: 'sg-1', score: 85 }] });
  });

  it('should correct a grade', () => {
    service.correct('sg-1', { score: 90 }).subscribe();

    const req = httpTesting.expectOne('/api/v1/student-grades/sg-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.score).toBe(90);
    req.flush({ success: true, data: { id: 'sg-1', score: 90 } });
  });

  it('should fetch grade report', () => {
    service.report({ termId: 't-1', classSectionId: 'cs-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/student-grades/report');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('t-1');
    expect(req.request.params.get('classSectionId')).toBe('cs-1');
    req.flush({
      success: true,
      data: { students: [], statistics: { averageScore: 0, passRate: 0 } },
    });
  });
});
