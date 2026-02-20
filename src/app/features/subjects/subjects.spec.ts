import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SubjectsComponent } from './subjects';

describe('SubjectsComponent', () => {
  let fixture: ComponentFixture<SubjectsComponent>;
  let component: SubjectsComponent;
  let httpTesting: HttpTestingController;

  const mockSubjectsResponse = {
    success: true,
    data: [
      {
        id: 'sub-1',
        schoolId: 'school-1',
        name: 'Mathematics',
        code: 'MATH',
        isLab: false,
        isElective: false,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        subjectGrades: [{ gradeId: 'grade-1', grade: { id: 'grade-1', name: 'Grade 1' } }],
      },
    ],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SubjectsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    httpTesting.expectOne((r) => r.url === '/api/v1/subjects').flush(mockSubjectsResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load subjects on init', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.subjects().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('SUBJECTS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by search', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onSearch({ target: { value: 'math' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.params.get('search')).toBe('math');
    req.flush(mockSubjectsResponse);

    expect(component.query().search).toBe('math');
    expect(component.query().page).toBe(1);
  });

  it('should filter by grade', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onGradeFilter({ target: { value: 'grade-1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.params.get('gradeId')).toBe('grade-1');
    req.flush(mockSubjectsResponse);

    expect(component.query().gradeId).toBe('grade-1');
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...mockSubjectsResponse, meta: { page: 2, limit: 10, total: 25, totalPages: 2 } });

    expect(component.query().page).toBe(2);
  });

  it('should render subjects table when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('Mathematics');
    expect(el.textContent).toContain('MATH');
  });

  it('should show empty state when no subjects', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    httpTesting
      .expectOne((r) => r.url === '/api/v1/subjects')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('tbody')).toBeNull();
  });
});
