import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TeacherService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list teachers', () => {
    service.list({ page: 1, limit: 10 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list teachers with search filter', () => {
    service.list({ search: 'ahmed' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.params.get('search')).toBe('ahmed');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list teachers with status filter', () => {
    service.list({ status: 'active' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.params.get('status')).toBe('active');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a teacher by id', () => {
    service.get('teacher-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'teacher-1' } });
  });

  it('should create a teacher', () => {
    const body = {
      teacherCode: 'TCH001',
      firstName: 'Ahmed',
      lastName: 'Ali',
      gender: 'male' as const,
      hireDate: '2025-09-01',
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/teachers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a teacher', () => {
    service.update('teacher-1', { firstName: 'Mohammed' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ firstName: 'Mohammed' });
    req.flush({ success: true, data: { id: 'teacher-1' } });
  });

  it('should delete a teacher', () => {
    service.delete('teacher-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
