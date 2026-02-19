import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ClassSectionsComponent } from './class-sections';

describe('ClassSectionsComponent', () => {
  let fixture: ComponentFixture<ClassSectionsComponent>;
  let component: ClassSectionsComponent;
  let httpTesting: HttpTestingController;

  const mockSectionsResponse = {
    success: true,
    data: [
      {
        id: 'cs-1',
        academicYearId: 'year-1',
        gradeId: 'grade-1',
        name: 'Section A',
        capacity: 30,
        homeroomTeacherId: null,
        schoolId: 'school-1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        academicYear: { id: 'year-1', name: '2025-2026' },
        grade: { id: 'grade-1', name: 'Grade 1' },
        homeroomTeacher: null,
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassSectionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ClassSectionsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const yearsReq = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    yearsReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const gradesReq = httpTesting.expectOne((r) => r.url === '/api/v1/grades');
    gradesReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const sectionsReq = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    sectionsReq.flush(mockSectionsResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load sections on init', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.sections().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/academic-years')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('CLASS_SECTIONS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by academic year', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onYearFilter({ target: { value: 'year-1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.params.get('academicYearId')).toBe('year-1');
    req.flush(mockSectionsResponse);

    expect(component.query().academicYearId).toBe('year-1');
    expect(component.query().page).toBe(1);
  });

  it('should filter by grade', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onGradeFilter({ target: { value: 'grade-1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.params.get('gradeId')).toBe('grade-1');
    req.flush(mockSectionsResponse);

    expect(component.query().gradeId).toBe('grade-1');
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...mockSectionsResponse, meta: { page: 2, limit: 20, total: 25, totalPages: 2 } });

    expect(component.query().page).toBe(2);
  });

  it('should render sections table when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('Section A');
    expect(el.textContent).toContain('Grade 1');
  });

  it('should show empty state when no sections', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/academic-years')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    req.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('tbody')).toBeNull();
  });
});
