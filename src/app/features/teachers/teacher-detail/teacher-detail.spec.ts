import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherDetailComponent } from './teacher-detail';

describe('TeacherDetailComponent', () => {
  let fixture: ComponentFixture<TeacherDetailComponent>;
  let component: TeacherDetailComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockTeacher = {
    id: 'teacher-1',
    teacherCode: 'TCH001',
    firstName: 'Ahmed',
    lastName: 'Ali',
    gender: 'male',
    nationalId: '1234567890',
    phone: '555-1234',
    email: 'ahmed@example.com',
    specialization: 'Mathematics',
    qualification: 'PhD',
    photoUrl: null,
    hireDate: '2025-09-01',
    departmentId: null,
    status: 'active',
    schoolId: 'school-1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'teacher-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TeacherDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushTeacher(): void {
    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    req.flush({ success: true, data: mockTeacher });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushTeacher();
    expect(component).toBeTruthy();
  });

  it('should load teacher on init', () => {
    fixture.detectChanges();
    flushTeacher();

    expect(component.teacher()).toBeTruthy();
    expect(component.teacher()!.firstName).toBe('Ahmed');
    expect(component.teacher()!.lastName).toBe('Ali');
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('TEACHERS.LOAD_ERROR');
  });

  it('should render teacher details', () => {
    fixture.detectChanges();
    flushTeacher();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ahmed');
    expect(el.textContent).toContain('Ali');
    expect(el.textContent).toContain('TCH001');
    expect(el.textContent).toContain('555-1234');
    expect(el.textContent).toContain('ahmed@example.com');
  });

  it('should show delete confirmation dialog', () => {
    fixture.detectChanges();
    flushTeacher();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should delete teacher and navigate', () => {
    fixture.detectChanges();
    flushTeacher();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.confirmDelete();
    component.deleteTeacher();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    fixture.detectChanges();
    flushTeacher();

    component.confirmDelete();
    component.deleteTeacher();

    const req = httpTesting.expectOne('/api/v1/teachers/teacher-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.deleting()).toBe(false);
    expect(component.showDeleteConfirm()).toBe(false);
  });
});
