import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ExamFormComponent } from './exam-form';

describe('ExamFormComponent', () => {
  let fixture: ComponentFixture<ExamFormComponent>;
  let component: ExamFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/exams/new');
    fixture = TestBed.createComponent(ExamFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDropdowns(): void {
    const yearReq = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    yearReq.flush({
      success: true,
      data: [{ id: 'ay-1', name: '2025-2026', isActive: true }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    const scaleReq = httpTesting.expectOne((r) => r.url === '/api/v1/grading-scales');
    scaleReq.flush({
      success: true,
      data: [{ id: 'gs-1', name: 'Standard', levels: [] }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  }

  it('should create in add mode', () => {
    fixture.detectChanges();
    flushDropdowns();

    expect(component).toBeTruthy();
    expect(component.isEdit()).toBe(false);
  });

  it('should load dropdowns on init', () => {
    fixture.detectChanges();
    flushDropdowns();

    expect(component.academicYears().length).toBe(1);
    expect(component.gradingScales().length).toBe(1);
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    flushDropdowns();

    component.onSubmit();
    expect(component.saving()).toBe(false);
  });

  it('should submit valid form for creation', () => {
    fixture.detectChanges();
    flushDropdowns();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.form.patchValue({
      name: 'Final Exam',
      examType: 'final',
      academicYearId: 'ay-1',
      termId: 't-1',
      gradingScaleId: 'gs-1',
      weight: 50,
    });

    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/exams');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Final Exam');
    expect(req.request.body.examType).toBe('final');
    req.flush({ success: true, data: { id: 'e-new' } });

    expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'exams', 'e-new']);
  });

  it('should load terms when academic year changes', () => {
    fixture.detectChanges();
    flushDropdowns();

    component.form.controls.academicYearId.setValue('ay-1');
    component.onAcademicYearChange();

    const termReq = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years/ay-1/terms');
    termReq.flush({
      success: true,
      data: [{ id: 't-1', name: 'Term 1' }],
    });

    expect(component.terms().length).toBe(1);
  });
});
