import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ClassSectionDetailComponent } from './class-section-detail';

describe('ClassSectionDetailComponent', () => {
  let fixture: ComponentFixture<ClassSectionDetailComponent>;
  let component: ClassSectionDetailComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockSection = {
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
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ClassSectionDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'cs-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/class-sections/cs-1');
    fixture = TestBed.createComponent(ClassSectionDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushSection(): void {
    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    req.flush({ success: true, data: mockSection });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushSection();
    expect(component).toBeTruthy();
  });

  it('should load section on init', () => {
    fixture.detectChanges();
    flushSection();

    expect(component.section()).toBeTruthy();
    expect(component.section()!.name).toBe('Section A');
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('CLASS_SECTIONS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should render section details when loaded', () => {
    fixture.detectChanges();
    flushSection();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Section A');
    expect(el.textContent).toContain('Grade 1');
    expect(el.textContent).toContain('2025-2026');
    expect(el.textContent).toContain('30');
  });

  it('should show delete confirmation dialog', () => {
    fixture.detectChanges();
    flushSection();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should delete section', () => {
    fixture.detectChanges();
    flushSection();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.confirmDelete();
    component.deleteSection();

    const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigateSpy).toHaveBeenCalled();
  });
});
