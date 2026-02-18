import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { SchoolService } from './school.service';
import { AuthService } from './auth.service';

describe('SchoolService', () => {
  let service: SchoolService;
  let authService: AuthService;
  let httpTesting: HttpTestingController;
  let router: Router;

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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'schools/:schoolId', children: [{ path: '**', children: [] }] },
          { path: '**', children: [] },
        ]),
      ],
    });

    service = TestBed.inject(SchoolService);
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null for currentSchoolId when not on a school route', () => {
    expect(service.currentSchoolId()).toBeNull();
  });

  it('should extract currentSchoolId from route URL', async () => {
    await router.navigateByUrl('/schools/school-abc/dashboard');
    expect(service.currentSchoolId()).toBe('school-abc');
  });

  it('should update currentSchoolId on navigation', async () => {
    await router.navigateByUrl('/schools/school-1/users');
    expect(service.currentSchoolId()).toBe('school-1');

    await router.navigateByUrl('/schools/school-2/users');
    expect(service.currentSchoolId()).toBe('school-2');
  });

  it('should return false for isSuperAdmin when no user loaded', () => {
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('should return true for isSuperAdmin when user has no schools', () => {
    loginAs({ schools: [] });
    expect(service.isSuperAdmin()).toBe(true);
  });

  it('should return false for isSuperAdmin when user has schools', () => {
    loginAs({ schools: [{ id: 's1', name: 'School One' }] });
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('should return user schools for non-super-admin', () => {
    loginAs({ schools: [{ id: 's1', name: 'School One' }] });
    expect(service.schools()).toEqual([{ id: 's1', name: 'School One' }]);
  });

  it('should return platform schools for super admin after fetch', () => {
    loginAs({ schools: [] });
    expect(service.schools()).toEqual([]);

    service.fetchSchools().subscribe();
    httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools').flush(mockSchoolsResponse);

    expect(service.schools().length).toBe(2);
  });

  it('should compute hasMultipleSchools', () => {
    loginAs({
      schools: [
        { id: 's1', name: 'One' },
        { id: 's2', name: 'Two' },
      ],
    });
    expect(service.hasMultipleSchools()).toBe(true);
  });

  it('should compute selectedSchool from route and schools list', async () => {
    loginAs({
      schools: [
        { id: 's1', name: 'School One' },
        { id: 's2', name: 'School Two' },
      ],
    });
    await router.navigateByUrl('/schools/s1/dashboard');

    expect(service.selectedSchool()?.name).toBe('School One');
  });

  it('should return null for selectedSchool when no match', async () => {
    loginAs({ schools: [{ id: 's1', name: 'School One' }] });
    await router.navigateByUrl('/schools/nonexistent/dashboard');

    expect(service.selectedSchool()).toBeNull();
  });

  function loginAs(overrides: { schools: { id: string; name: string }[] }): void {
    const roles =
      overrides.schools.length === 0
        ? [{ roleId: 'r1', roleName: 'super_admin', schoolId: null, schoolName: null }]
        : overrides.schools.map((s) => ({
            roleId: 'r1',
            roleName: 'school_admin',
            schoolId: s.id,
            schoolName: s.name,
          }));

    authService.login({ email: 'test@test.com', password: 'pass' }).subscribe();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/auth/login')
      .flush({
        success: true,
        data: {
          accessToken: 'token',
          refreshToken: 'refresh',
          user: {
            id: 'u1',
            email: 'test@test.com',
            roles: roles.map((r) => r.roleName),
            permissions: [],
            schoolId: overrides.schools.length === 1 ? overrides.schools[0].id : null,
            schools: overrides.schools,
          },
        },
      });

    httpTesting
      .expectOne((r) => r.url === '/api/v1/auth/me')
      .flush({
        success: true,
        data: {
          id: 'u1',
          email: 'test@test.com',
          phone: null,
          isActive: true,
          lastLoginAt: null,
          roles,
          permissions: [],
        },
      });
  }
});
