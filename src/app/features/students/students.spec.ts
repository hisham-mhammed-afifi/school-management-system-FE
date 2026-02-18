import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { StudentsComponent } from './students';

describe('StudentsComponent', () => {
  let fixture: ComponentFixture<StudentsComponent>;
  let component: StudentsComponent;
  let httpTesting: HttpTestingController;

  const mockStudentsResponse = {
    success: true,
    data: [
      {
        id: 's1',
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
        email: 'john@example.com',
        photoUrl: null,
        medicalNotes: null,
        admissionDate: '2025-09-01',
        status: 'active',
        schoolId: 'school-1',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    req.flush(mockStudentsResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudentsResponse);

    expect(component.students().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('STUDENTS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by search', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onSearch({ target: { value: 'john' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.params.get('search')).toBe('john');
    req.flush(mockStudentsResponse);

    expect(component.query().search).toBe('john');
    expect(component.query().page).toBe(1);
  });

  it('should filter by status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onStatusFilter({ target: { value: 'active' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.params.get('status')).toBe('active');
    req.flush(mockStudentsResponse);

    expect(component.query().status).toBe('active');
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...mockStudentsResponse, meta: { page: 2, limit: 20, total: 25, totalPages: 2 } });

    expect(component.query().page).toBe(2);
  });

  it('should render students table when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('John');
    expect(el.textContent).toContain('Doe');
    expect(el.textContent).toContain('STU001');
  });

  it('should show empty state when no students', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/students');
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
