import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ClassSectionFormComponent } from './class-section-form';

describe('ClassSectionFormComponent', () => {
  let fixture: ComponentFixture<ClassSectionFormComponent>;
  let component: ClassSectionFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const emptyPaginated = {
    success: true,
    data: [],
    meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
  };

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [ClassSectionFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap } },
        },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  function flushDropdowns(): void {
    httpTesting.expectOne((r) => r.url === '/api/v1/academic-years').flush(emptyPaginated);
    httpTesting.expectOne((r) => r.url === '/api/v1/grades').flush(emptyPaginated);
    httpTesting.expectOne((r) => r.url === '/api/v1/teachers').flush(emptyPaginated);
  }

  describe('create mode', () => {
    beforeEach(async () => {
      setupTestBed(null);
      await router.navigateByUrl('/schools/test-school/class-sections/new');
      fixture = TestBed.createComponent(ClassSectionFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('should create in create mode', () => {
      flushDropdowns();
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require name and capacity', () => {
      flushDropdowns();

      component.form.controls.name.setValue('');
      component.form.controls.name.markAsTouched();

      expect(component.form.controls.name.errors).toBeTruthy();
    });

    it('should submit create request', () => {
      flushDropdowns();
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({
        academicYearId: 'year-1',
        gradeId: 'grade-1',
        name: 'Section A',
        capacity: 30,
      });

      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/class-sections');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Section A');
      expect(req.request.body.capacity).toBe(30);
      req.flush({ success: true, data: { id: 'new-id' } });

      expect(navigateSpy).toHaveBeenCalledWith([
        '/schools',
        'test-school',
        'class-sections',
        'new-id',
      ]);
    });

    it('should not submit when form is invalid', () => {
      flushDropdowns();

      component.onSubmit();

      httpTesting.expectNone('/api/v1/class-sections');
      expect(component.saving()).toBe(false);
    });

    it('should handle create error', () => {
      flushDropdowns();

      component.form.patchValue({
        academicYearId: 'year-1',
        gradeId: 'grade-1',
        name: 'Section A',
        capacity: 30,
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/class-sections');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Section already exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Section already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      setupTestBed('cs-1');
      await router.navigateByUrl('/schools/test-school/class-sections/cs-1/edit');
      fixture = TestBed.createComponent(ClassSectionFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushSection(): void {
      const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
      req.flush({
        success: true,
        data: {
          id: 'cs-1',
          academicYearId: 'year-1',
          gradeId: 'grade-1',
          name: 'Section A',
          capacity: 30,
          homeroomTeacherId: null,
        },
      });
    }

    it('should create in edit mode', () => {
      flushDropdowns();
      flushSection();

      expect(component.isEdit()).toBe(true);
      expect(component.form.getRawValue().name).toBe('Section A');
    });

    it('should disable academicYearId and gradeId in edit mode', () => {
      flushDropdowns();
      flushSection();

      expect(component.form.controls.academicYearId.disabled).toBe(true);
      expect(component.form.controls.gradeId.disabled).toBe(true);
    });

    it('should submit update request', () => {
      flushDropdowns();
      flushSection();
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.controls.name.setValue('Section B');
      component.onSubmit();

      const updateReq = httpTesting.expectOne('/api/v1/class-sections/cs-1');
      expect(updateReq.request.method).toBe('PATCH');
      expect(updateReq.request.body.name).toBe('Section B');
      updateReq.flush({ success: true, data: { id: 'cs-1' } });

      expect(navigateSpy).toHaveBeenCalledWith([
        '/schools',
        'test-school',
        'class-sections',
        'cs-1',
      ]);
    });

    it('should show error on load failure', () => {
      flushDropdowns();

      const req = httpTesting.expectOne('/api/v1/class-sections/cs-1');
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage()).toBe('CLASS_SECTIONS.LOAD_ERROR');
    });
  });
});
