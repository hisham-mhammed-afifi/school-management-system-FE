import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SubjectDetailComponent } from './subject-detail';

describe('SubjectDetailComponent', () => {
  let fixture: ComponentFixture<SubjectDetailComponent>;
  let component: SubjectDetailComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockSubject = {
    id: 'sub-1',
    schoolId: 'school-1',
    name: 'Mathematics',
    code: 'MATH',
    isLab: false,
    isElective: false,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    subjectGrades: [{ gradeId: 'grade-1', grade: { id: 'grade-1', name: 'Grade 1' } }],
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SubjectDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'sub-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/subjects/sub-1');
    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushSubject(): void {
    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    req.flush({ success: true, data: mockSubject });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushSubject();
    expect(component).toBeTruthy();
  });

  it('should load subject on init', () => {
    fixture.detectChanges();
    flushSubject();

    expect(component.subject()).toBeTruthy();
    expect(component.subject()!.name).toBe('Mathematics');
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('SUBJECTS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should render subject details when loaded', () => {
    fixture.detectChanges();
    flushSubject();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mathematics');
    expect(el.textContent).toContain('MATH');
    expect(el.textContent).toContain('Grade 1');
  });

  it('should show delete confirmation dialog', () => {
    fixture.detectChanges();
    flushSubject();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should delete subject', () => {
    fixture.detectChanges();
    flushSubject();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.confirmDelete();
    component.deleteSubject();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should open grade manager and load grades', () => {
    fixture.detectChanges();
    flushSubject();

    component.openGradeManager();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grades');
    req.flush({
      success: true,
      data: [
        {
          id: 'grade-1',
          name: 'Grade 1',
          levelOrder: 1,
          schoolId: 'school-1',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'grade-2',
          name: 'Grade 2',
          levelOrder: 2,
          schoolId: 'school-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    expect(component.showGradeManager()).toBe(true);
    expect(component.allGrades().length).toBe(2);
    expect(component.isGradeSelected('grade-1')).toBe(true);
    expect(component.isGradeSelected('grade-2')).toBe(false);
  });

  it('should toggle grade selection', () => {
    fixture.detectChanges();
    flushSubject();

    component.selectedGradeIds.set(new Set(['grade-1']));

    component.toggleGrade('grade-2');
    expect(component.isGradeSelected('grade-2')).toBe(true);

    component.toggleGrade('grade-1');
    expect(component.isGradeSelected('grade-1')).toBe(false);
  });

  it('should save grades', () => {
    fixture.detectChanges();
    flushSubject();

    component.selectedGradeIds.set(new Set(['grade-1', 'grade-2']));
    component.saveGrades();

    const req = httpTesting.expectOne('/api/v1/subjects/sub-1/grades');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.gradeIds).toEqual(expect.arrayContaining(['grade-1', 'grade-2']));
    req.flush({ success: true, data: { subjectId: 'sub-1', assignedCount: 2 } });

    // After save, it reloads the subject
    const reloadReq = httpTesting.expectOne('/api/v1/subjects/sub-1');
    reloadReq.flush({ success: true, data: mockSubject });

    expect(component.showGradeManager()).toBe(false);
    expect(component.gradeMessage()).toBe('SUBJECTS.GRADES_SAVED');
  });
});
