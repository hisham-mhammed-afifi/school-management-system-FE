import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { StudentFormComponent } from './student-form';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let component: StudentFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [StudentFormComponent],
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
      await router.navigateByUrl('/schools/test-school/students/new');
      fixture = TestBed.createComponent(StudentFormComponent);
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
      expect(component.form.controls.studentCode.errors?.['required']).toBeTruthy();
      expect(component.form.controls.firstName.errors?.['required']).toBeTruthy();
      expect(component.form.controls.lastName.errors?.['required']).toBeTruthy();
      expect(component.form.controls.dateOfBirth.errors?.['required']).toBeTruthy();
      expect(component.form.controls.admissionDate.errors?.['required']).toBeTruthy();
    });

    it('should submit create request', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({
        studentCode: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2010-05-15',
        gender: 'male',
        admissionDate: '2025-09-01',
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/students');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.studentCode).toBe('STU001');
      expect(req.request.body.firstName).toBe('John');
      expect(req.request.body.lastName).toBe('Doe');
      req.flush({ success: true, data: { id: 'new-id' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'students', 'new-id']);
    });

    it('should handle create error', () => {
      component.form.patchValue({
        studentCode: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2010-05-15',
        admissionDate: '2025-09-01',
      });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/students');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Student code exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Student code exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      setupTestBed('student-1');
      await router.navigateByUrl('/schools/test-school/students/student-1/edit');
      fixture = TestBed.createComponent(StudentFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushStudent(): void {
      const req = httpTesting.expectOne('/api/v1/students/student-1');
      req.flush({
        success: true,
        data: {
          id: 'student-1',
          studentCode: 'STU001',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '2010-05-15',
          gender: 'male',
          nationalId: null,
          nationality: null,
          religion: null,
          bloodType: null,
          address: null,
          phone: null,
          email: null,
          photoUrl: null,
          medicalNotes: null,
          admissionDate: '2025-09-01',
          status: 'active',
          schoolId: 'school-1',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      });
    }

    it('should load student data in edit mode', () => {
      flushStudent();

      expect(component.isEdit()).toBe(true);
      expect(component.form.getRawValue().studentCode).toBe('STU001');
      expect(component.form.value.firstName).toBe('John');
      expect(component.form.value.lastName).toBe('Doe');
    });

    it('should disable student code in edit mode', () => {
      flushStudent();

      expect(component.form.controls.studentCode.disabled).toBe(true);
    });

    it('should submit update request', () => {
      flushStudent();
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({ firstName: 'Jane' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/students/student-1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.firstName).toBe('Jane');
      req.flush({ success: true, data: { id: 'student-1' } });

      expect(navigateSpy).toHaveBeenCalledWith([
        '/schools',
        'test-school',
        'students',
        'student-1',
      ]);
    });

    it('should show error when student load fails', () => {
      const req = httpTesting.expectOne('/api/v1/students/student-1');
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(component.errorMessage()).toBe('STUDENTS.LOAD_ERROR');
      expect(component.loading()).toBe(false);
    });
  });
});
