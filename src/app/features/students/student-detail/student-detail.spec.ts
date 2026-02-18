import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { StudentDetailComponent } from './student-detail';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let component: StudentDetailComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockStudent = {
    id: 'student-1',
    studentCode: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '2010-05-15',
    gender: 'male',
    nationalId: '1234567890',
    nationality: 'Saudi',
    religion: 'Islam',
    bloodType: 'A_POS',
    address: '123 Main St',
    phone: '555-1234',
    email: 'john@example.com',
    photoUrl: null,
    medicalNotes: 'No allergies',
    admissionDate: '2025-09-01',
    status: 'active',
    schoolId: 'school-1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'student-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushStudent(): void {
    const req = httpTesting.expectOne('/api/v1/students/student-1');
    req.flush({ success: true, data: mockStudent });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushStudent();
    expect(component).toBeTruthy();
  });

  it('should load student on init', () => {
    fixture.detectChanges();
    flushStudent();

    expect(component.student()).toBeTruthy();
    expect(component.student()!.firstName).toBe('John');
    expect(component.student()!.lastName).toBe('Doe');
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('STUDENTS.LOAD_ERROR');
  });

  it('should render student details', () => {
    fixture.detectChanges();
    flushStudent();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('John');
    expect(el.textContent).toContain('Doe');
    expect(el.textContent).toContain('STU001');
    expect(el.textContent).toContain('555-1234');
    expect(el.textContent).toContain('john@example.com');
  });

  it('should show delete confirmation dialog', () => {
    fixture.detectChanges();
    flushStudent();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should delete student and navigate', () => {
    fixture.detectChanges();
    flushStudent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.confirmDelete();
    component.deleteStudent();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigateSpy).toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    fixture.detectChanges();
    flushStudent();

    component.confirmDelete();
    component.deleteStudent();

    const req = httpTesting.expectOne('/api/v1/students/student-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.deleting()).toBe(false);
    expect(component.showDeleteConfirm()).toBe(false);
  });
});
