import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SubjectFormComponent } from './subject-form';

describe('SubjectFormComponent', () => {
  let fixture: ComponentFixture<SubjectFormComponent>;
  let component: SubjectFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [SubjectFormComponent],
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

  describe('create mode', () => {
    beforeEach(async () => {
      setupTestBed(null);
      await router.navigateByUrl('/schools/test-school/subjects/new');
      fixture = TestBed.createComponent(SubjectFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require name and code', () => {
      component.form.controls.name.setValue('');
      component.form.controls.name.markAsTouched();
      component.form.controls.code.setValue('');
      component.form.controls.code.markAsTouched();

      expect(component.form.controls.name.errors).toBeTruthy();
      expect(component.form.controls.code.errors).toBeTruthy();
    });

    it('should submit create request', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({
        name: 'Mathematics',
        code: 'MATH',
        isLab: false,
        isElective: false,
      });

      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/subjects');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Mathematics');
      expect(req.request.body.code).toBe('MATH');
      req.flush({ success: true, data: { id: 'new-id' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'subjects', 'new-id']);
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();

      httpTesting.expectNone('/api/v1/subjects');
      expect(component.saving()).toBe(false);
    });

    it('should handle create error', () => {
      component.form.patchValue({
        name: 'Mathematics',
        code: 'MATH',
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/subjects');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Subject code already exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Subject code already exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      setupTestBed('sub-1');
      await router.navigateByUrl('/schools/test-school/subjects/sub-1/edit');
      fixture = TestBed.createComponent(SubjectFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushSubject(): void {
      const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
      req.flush({
        success: true,
        data: {
          id: 'sub-1',
          schoolId: 'school-1',
          name: 'Mathematics',
          code: 'MATH',
          isLab: true,
          isElective: false,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          subjectGrades: [],
        },
      });
    }

    it('should create in edit mode', () => {
      flushSubject();

      expect(component.isEdit()).toBe(true);
      expect(component.form.getRawValue().name).toBe('Mathematics');
      expect(component.form.getRawValue().isLab).toBe(true);
    });

    it('should submit update request', () => {
      flushSubject();
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.controls.name.setValue('Math');
      component.onSubmit();

      const updateReq = httpTesting.expectOne('/api/v1/subjects/sub-1');
      expect(updateReq.request.method).toBe('PATCH');
      expect(updateReq.request.body.name).toBe('Math');
      updateReq.flush({ success: true, data: { id: 'sub-1' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'subjects', 'sub-1']);
    });

    it('should show error on load failure', () => {
      const req = httpTesting.expectOne('/api/v1/subjects/sub-1');
      req.flush(null, { status: 500, statusText: 'Server Error' });

      expect(component.errorMessage()).toBe('SUBJECTS.LOAD_ERROR');
    });
  });
});
