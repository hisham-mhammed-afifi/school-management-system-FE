import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherFormComponent } from './teacher-form';

describe('TeacherFormComponent', () => {
  let fixture: ComponentFixture<TeacherFormComponent>;
  let component: TeacherFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [TeacherFormComponent],
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
      await router.navigateByUrl('/schools/test-school/teachers/new');
      fixture = TestBed.createComponent(TeacherFormComponent);
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

    it('should require mandatory fields', () => {
      component.onSubmit();
      expect(component.form.controls.teacherCode.errors?.['required']).toBeTruthy();
      expect(component.form.controls.firstName.errors?.['required']).toBeTruthy();
      expect(component.form.controls.lastName.errors?.['required']).toBeTruthy();
      expect(component.form.controls.hireDate.errors?.['required']).toBeTruthy();
    });

    it('should submit create request', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({
        teacherCode: 'TCH001',
        firstName: 'Ahmed',
        lastName: 'Ali',
        gender: 'male',
        hireDate: '2025-09-01',
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/teachers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.teacherCode).toBe('TCH001');
      expect(req.request.body.firstName).toBe('Ahmed');
      expect(req.request.body.lastName).toBe('Ali');
      req.flush({ success: true, data: { id: 'new-id' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'teachers', 'new-id']);
    });

    it('should handle create error', () => {
      component.form.patchValue({
        teacherCode: 'TCH001',
        firstName: 'Ahmed',
        lastName: 'Ali',
        hireDate: '2025-09-01',
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/teachers');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Teacher code exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Teacher code exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      setupTestBed('teacher-1');
      await router.navigateByUrl('/schools/test-school/teachers/teacher-1/edit');
      fixture = TestBed.createComponent(TeacherFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushTeacher(): void {
      const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
      req.flush({
        success: true,
        data: {
          id: 'teacher-1',
          teacherCode: 'TCH001',
          firstName: 'Ahmed',
          lastName: 'Ali',
          gender: 'male',
          nationalId: null,
          phone: null,
          email: null,
          specialization: null,
          qualification: null,
          photoUrl: null,
          hireDate: '2025-09-01',
          departmentId: null,
          status: 'active',
          schoolId: 'school-1',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      });
    }

    it('should load teacher data in edit mode', () => {
      flushTeacher();

      expect(component.isEdit()).toBe(true);
      expect(component.form.getRawValue().teacherCode).toBe('TCH001');
      expect(component.form.value.firstName).toBe('Ahmed');
      expect(component.form.value.lastName).toBe('Ali');
    });

    it('should disable teacher code in edit mode', () => {
      flushTeacher();

      expect(component.form.controls.teacherCode.disabled).toBe(true);
    });

    it('should submit update request', () => {
      flushTeacher();
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({ firstName: 'Mohammed' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.firstName).toBe('Mohammed');
      req.flush({ success: true, data: { id: 'teacher-1' } });

      expect(navigateSpy).toHaveBeenCalledWith([
        '/schools',
        'test-school',
        'teachers',
        'teacher-1',
      ]);
    });

    it('should show error when teacher load fails', () => {
      const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(component.errorMessage()).toBe('TEACHERS.LOAD_ERROR');
      expect(component.loading()).toBe(false);
    });
  });
});
