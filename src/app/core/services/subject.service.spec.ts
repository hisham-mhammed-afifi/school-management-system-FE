import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SubjectService } from './subject.service';

describe('SubjectService', () => {
  let service: SubjectService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SubjectService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list subjects', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should list subjects with search', () => {
    service.list({ search: 'math' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.params.get('search')).toBe('math');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should list subjects with gradeId filter', () => {
    service.list({ gradeId: 'grade-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.params.get('gradeId')).toBe('grade-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should get a subject by id', () => {
    service.get('sub-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'sub-1' } });
  });

  it('should create a subject', () => {
    service.create({ name: 'Math', code: 'MATH' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/subjects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Math');
    expect(req.request.body.code).toBe('MATH');
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a subject', () => {
    service.update('sub-1', { name: 'Mathematics' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.name).toBe('Mathematics');
    req.flush({ success: true, data: { id: 'sub-1' } });
  });

  it('should delete a subject', () => {
    service.delete('sub-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should set grades for a subject', () => {
    service.setGrades('sub-1', ['grade-1', 'grade-2']).subscribe();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1/grades');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.gradeIds).toEqual(['grade-1', 'grade-2']);
    req.flush({ success: true, data: { subjectId: 'sub-1', assignedCount: 2 } });
  });
});
