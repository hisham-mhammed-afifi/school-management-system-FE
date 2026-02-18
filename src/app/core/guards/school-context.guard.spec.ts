import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { schoolContextGuard } from './school-context.guard';
import { AuthService } from '@core/services/auth.service';
import type { ApiResponse } from '@core/models/api';
import type { LoginResponse, UserProfile } from '@core/models/auth';

describe('schoolContextGuard', () => {
  let httpTesting: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  const mockLoginResponse: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: '1',
        email: 'test@test.com',
        roles: ['teacher'],
        permissions: ['read:students'],
        schoolId: 'school-1',
        schools: [{ id: 'school-1', name: 'School One' }],
      },
    },
  };

  const singleSchoolProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '1',
      email: 'teacher@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [
        { roleId: 'r1', roleName: 'teacher', schoolId: 'school-1', schoolName: 'School One' },
      ],
      permissions: ['read:students'],
    },
  };

  const multiSchoolProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '2',
      email: 'teacher@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [
        { roleId: 'r1', roleName: 'teacher', schoolId: 'school-1', schoolName: 'School One' },
        { roleId: 'r2', roleName: 'examiner', schoolId: 'school-2', schoolName: 'School Two' },
      ],
      permissions: ['read:students'],
    },
  };

  const superAdminProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '3',
      email: 'admin@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [{ roleId: 'r1', roleName: 'super_admin', schoolId: null, schoolName: null }],
      permissions: ['*'],
    },
  };

  function loginAs(profile: ApiResponse<UserProfile>): void {
    authService.login({ email: 'a@b.com', password: 'pass' }).subscribe();
    httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
    httpTesting.expectOne('/api/v1/auth/me').flush(profile);
  }

  function buildRoute(schoolId: string | null) {
    const params: Record<string, string> = {};
    if (schoolId) params['schoolId'] = schoolId;
    return { paramMap: convertToParamMap(params) } as never;
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should redirect to /login when user is not authenticated', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const route = buildRoute('school-1');

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /schools when schoolId param is missing', () => {
    loginAs(singleSchoolProfile);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const route = buildRoute(null);

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/schools']);
  });

  it('should allow super admin to access any school', () => {
    loginAs(superAdminProfile);
    const route = buildRoute('any-school-id');

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(true);
  });

  it('should allow access to an assigned school', () => {
    loginAs(singleSchoolProfile);
    const route = buildRoute('school-1');

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect single-school user to their school when accessing unauthorized school', () => {
    loginAs(singleSchoolProfile);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const route = buildRoute('school-999');

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'school-1', 'dashboard']);
  });

  it('should redirect multi-school user to /schools when accessing unauthorized school', () => {
    loginAs(multiSchoolProfile);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const route = buildRoute('school-999');

    const result = TestBed.runInInjectionContext(() => schoolContextGuard(route, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/schools']);
  });
});
