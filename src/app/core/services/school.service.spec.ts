import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SchoolService } from './school.service';
import { AuthService } from './auth.service';

describe('SchoolService', () => {
  let service: SchoolService;
  let authService: AuthService;
  let httpTesting: HttpTestingController;

  const mockSchoolsResponse = {
    success: true,
    data: [
      { id: 's1', name: 'School One' },
      { id: 's2', name: 'School Two' },
    ],
    meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(SchoolService);
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null for currentSchoolId when no user and no stored school', () => {
    expect(service.currentSchoolId()).toBeNull();
  });

  it('should return stored school for currentSchoolId when user not yet loaded', () => {
    service.selectSchool('s1');
    expect(service.currentSchoolId()).toBe('s1');
  });

  it('should return user schoolId for non-super-admin users', () => {
    loginAs({ schoolId: 'school-abc' });

    expect(service.isSuperAdmin()).toBe(false);
    expect(service.currentSchoolId()).toBe('school-abc');
  });

  it('should return selectedSchoolId for super admin users', () => {
    loginAs({ schoolId: null });
    service.selectSchool('s1');

    expect(service.isSuperAdmin()).toBe(true);
    expect(service.currentSchoolId()).toBe('s1');
  });

  it('should return null for super admin with no school selected', () => {
    loginAs({ schoolId: null });

    expect(service.currentSchoolId()).toBeNull();
  });

  it('should persist selected school to localStorage', () => {
    service.selectSchool('s1');
    expect(localStorage.getItem('selected_school_id')).toBe('s1');
  });

  it('should load selected school from localStorage', () => {
    localStorage.setItem('selected_school_id', 's2');

    // Re-create to pick up from localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    const freshService = TestBed.inject(SchoolService);
    expect(freshService.selectedSchoolId()).toBe('s2');
  });

  it('should clear selection', () => {
    service.selectSchool('s1');
    service.clearSelection();

    expect(service.selectedSchoolId()).toBeNull();
    expect(localStorage.getItem('selected_school_id')).toBeNull();
  });

  it('should fetch schools', () => {
    service.fetchSchools().subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    expect(req.request.method).toBe('GET');
    req.flush(mockSchoolsResponse);

    expect(service.schools().length).toBe(2);
    expect(service.loading()).toBe(false);
  });

  it('should compute selectedSchool from schools list', () => {
    service.selectSchool('s1');
    service.fetchSchools().subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush(mockSchoolsResponse);

    expect(service.selectedSchool()?.name).toBe('School One');
  });

  it('should return null for selectedSchool when no match', () => {
    service.selectSchool('nonexistent');
    expect(service.selectedSchool()).toBeNull();
  });

  function loginAs(overrides: { schoolId: string | null }): void {
    authService.login({ email: 'test@test.com', password: 'pass' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/auth/login');
    req.flush({
      success: true,
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: {
          id: 'u1',
          email: 'test@test.com',
          roles: ['super_admin'],
          permissions: [],
          schoolId: overrides.schoolId,
        },
      },
    });
  }
});
