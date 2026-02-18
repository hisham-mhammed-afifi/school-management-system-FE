import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StudentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list students', () => {
    service.list({ page: 1, limit: 10 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list students with search filter', () => {
    service.list({ search: 'john' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.params.get('search')).toBe('john');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list students with status filter', () => {
    service.list({ status: 'active' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.params.get('status')).toBe('active');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a student by id', () => {
    service.get('student-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'student-1' } });
  });

  it('should create a student', () => {
    const body = {
      studentCode: 'STU001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-01-01',
      gender: 'male' as const,
      admissionDate: '2025-09-01',
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a student', () => {
    service.update('student-1', { firstName: 'Jane' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ firstName: 'Jane' });
    req.flush({ success: true, data: { id: 'student-1' } });
  });

  it('should delete a student', () => {
    service.delete('student-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
