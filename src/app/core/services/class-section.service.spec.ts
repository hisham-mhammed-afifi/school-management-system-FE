import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClassSectionService } from './class-section.service';

describe('ClassSectionService', () => {
  let service: ClassSectionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ClassSectionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list class sections', () => {
    service.list({ page: 1, limit: 10 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list class sections with academicYearId filter', () => {
    service.list({ academicYearId: 'year-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.params.get('academicYearId')).toBe('year-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should list class sections with gradeId filter', () => {
    service.list({ gradeId: 'grade-1' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.params.get('gradeId')).toBe('grade-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } });
  });

  it('should get a class section by id', () => {
    service.get('cs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'cs-1' } });
  });

  it('should create a class section', () => {
    const body = {
      academicYearId: 'year-1',
      gradeId: 'grade-1',
      name: 'Section A',
      capacity: 30,
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/class-sections');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a class section', () => {
    service.update('cs-1', { name: 'Section B', capacity: 35 }).subscribe();

    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Section B', capacity: 35 });
    req.flush({ success: true, data: { id: 'cs-1' } });
  });

  it('should delete a class section', () => {
    service.delete('cs-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
