import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExamService } from './exam.service';

describe('ExamService', () => {
  let service: ExamService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExamService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list exams', () => {
    service.list({ page: 1, limit: 20, termId: 't-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('t-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get an exam', () => {
    service.get('e-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'e-1', name: 'Midterm' } });
  });

  it('should create an exam', () => {
    const body = {
      academicYearId: 'ay-1',
      termId: 't-1',
      gradingScaleId: 'gs-1',
      name: 'Final',
      examType: 'final' as const,
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/exams');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Final');
    req.flush({ success: true, data: { id: 'e-new', ...body } });
  });

  it('should update an exam', () => {
    service.update('e-1', { name: 'Updated Exam' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'e-1', name: 'Updated Exam' } });
  });

  it('should delete an exam', () => {
    service.delete('e-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should list exam subjects', () => {
    service.listSubjects('e-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1/subjects');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should add a subject to an exam', () => {
    const body = { subjectId: 's-1', gradeId: 'g-1', maxScore: 100 };
    service.addSubject('e-1', body).subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1/subjects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.subjectId).toBe('s-1');
    req.flush({ success: true, data: { id: 'es-1', ...body } });
  });

  it('should update an exam subject', () => {
    service.updateSubject('e-1', 'es-1', { maxScore: 50 }).subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1/subjects/es-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'es-1', maxScore: 50 } });
  });

  it('should remove a subject from an exam', () => {
    service.removeSubject('e-1', 'es-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/exams/e-1/subjects/es-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
