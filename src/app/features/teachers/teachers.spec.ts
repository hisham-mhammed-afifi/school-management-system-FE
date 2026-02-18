import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeachersComponent } from './teachers';

describe('TeachersComponent', () => {
  let fixture: ComponentFixture<TeachersComponent>;
  let component: TeachersComponent;
  let httpTesting: HttpTestingController;

  const mockTeachersResponse = {
    success: true,
    data: [
      {
        id: 't1',
        teacherCode: 'TCH001',
        firstName: 'Ahmed',
        lastName: 'Ali',
        gender: 'male',
        nationalId: null,
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
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TeachersComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    req.flush(mockTeachersResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load teachers on init', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeachersResponse);

    expect(component.teachers().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('TEACHERS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by search', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onSearch({ target: { value: 'ahmed' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.params.get('search')).toBe('ahmed');
    req.flush(mockTeachersResponse);

    expect(component.query().search).toBe('ahmed');
    expect(component.query().page).toBe(1);
  });

  it('should filter by status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onStatusFilter({ target: { value: 'active' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.params.get('status')).toBe('active');
    req.flush(mockTeachersResponse);

    expect(component.query().status).toBe('active');
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...mockTeachersResponse, meta: { page: 2, limit: 20, total: 25, totalPages: 2 } });

    expect(component.query().page).toBe(2);
  });

  it('should render teachers table when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('Ahmed');
    expect(el.textContent).toContain('Ali');
    expect(el.textContent).toContain('TCH001');
  });

  it('should show empty state when no teachers', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
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
