import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import type { ApiResponse } from '@core/models/api';
import type { LoginResponse, RefreshTokenResponse, UserProfile } from '@core/models/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockLoginResponse: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['teacher'],
        permissions: ['students.read'],
        schoolId: 'school-1',
        schools: [{ id: 'school-1', name: 'School One' }],
      },
    },
  };

  const mockUserProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '1',
      email: 'test@example.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [
        { roleId: 'r1', roleName: 'teacher', schoolId: 'school-1', schoolName: 'School One' },
      ],
      permissions: ['students.read'],
    },
  };

  function flushLogin(): void {
    httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
    httpTesting.expectOne('/api/v1/auth/me').flush(mockUserProfile);
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
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

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should be authenticated if a token exists in localStorage', () => {
    localStorage.setItem('access_token', 'existing-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    const freshService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);

    expect(freshService.isAuthenticated()).toBe(true);
    expect(freshService.accessToken).toBe('existing-token');
  });

  describe('login', () => {
    it('should store tokens and fetch user profile on successful login', () => {
      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const loginReq = httpTesting.expectOne('/api/v1/auth/login');
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual({ email: 'test@example.com', password: 'password' });
      loginReq.flush(mockLoginResponse);

      const meReq = httpTesting.expectOne('/api/v1/auth/me');
      expect(meReq.request.method).toBe('GET');
      meReq.flush(mockUserProfile);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()!.id).toBe('1');
      expect(service.user()!.email).toBe('test@example.com');
      expect(service.user()!.roles).toEqual(['teacher']);
      expect(service.user()!.schoolId).toBe('school-1');
      expect(service.user()!.schools).toEqual([{ id: 'school-1', name: 'School One' }]);
      expect(service.accessToken).toBe('test-access-token');
      expect(localStorage.getItem('access_token')).toBe('test-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('test-refresh-token');
    });

    it('should propagate errors on failed login', () => {
      let caughtError: unknown;

      service.login({ email: 'test@example.com', password: 'wrong' }).subscribe({
        error: (err) => (caughtError = err),
      });

      const req = httpTesting.expectOne('/api/v1/auth/login');
      req.flush(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(caughtError).toBeTruthy();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh the access token', () => {
      localStorage.setItem('refresh_token', 'old-refresh-token');

      const refreshResponse: ApiResponse<RefreshTokenResponse> = {
        success: true,
        data: { accessToken: 'new-access-token' },
      };

      service.refreshToken().subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(refreshResponse);

      expect(service.accessToken).toBe('new-access-token');
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
    });

    it('should clear session if no refresh token exists', () => {
      let caughtError: unknown;

      service.refreshToken().subscribe({
        error: (err) => (caughtError = err),
      });

      expect(caughtError).toBeTruthy();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear session on refresh failure', () => {
      localStorage.setItem('refresh_token', 'expired-token');

      service.refreshToken().subscribe({ error: () => {} });

      const req = httpTesting.expectOne('/api/v1/auth/refresh');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();
      flushLogin();

      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      httpTesting
        .expectOne('/api/v1/auth/logout')
        .flush({ success: true, data: { message: 'Logged out' } });

      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('fetchCurrentUser', () => {
    it('should map UserProfile to AuthUser and update the user signal', () => {
      service.fetchCurrentUser().subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUserProfile);

      const user = service.user()!;
      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.roles).toEqual(['teacher']);
      expect(user.permissions).toEqual(['students.read']);
      expect(user.schoolId).toBe('school-1');
      expect(user.schools).toEqual([{ id: 'school-1', name: 'School One' }]);
    });

    it('should set schoolId to null for super admin with no school-scoped roles', () => {
      const superAdminProfile: ApiResponse<UserProfile> = {
        success: true,
        data: {
          id: '2',
          email: 'admin@example.com',
          phone: null,
          isActive: true,
          lastLoginAt: null,
          roles: [{ roleId: 'r1', roleName: 'super_admin', schoolId: null, schoolName: null }],
          permissions: ['*'],
        },
      };

      service.fetchCurrentUser().subscribe();
      httpTesting.expectOne('/api/v1/auth/me').flush(superAdminProfile);

      const user = service.user()!;
      expect(user.schoolId).toBeNull();
      expect(user.schools).toEqual([]);
    });

    it('should set schoolId to null for multi-school users', () => {
      const multiSchoolProfile: ApiResponse<UserProfile> = {
        success: true,
        data: {
          id: '3',
          email: 'teacher@example.com',
          phone: null,
          isActive: true,
          lastLoginAt: null,
          roles: [
            { roleId: 'r1', roleName: 'teacher', schoolId: 'school-1', schoolName: 'School One' },
            {
              roleId: 'r2',
              roleName: 'examiner',
              schoolId: 'school-2',
              schoolName: 'School Two',
            },
          ],
          permissions: ['students.read'],
        },
      };

      service.fetchCurrentUser().subscribe();
      httpTesting.expectOne('/api/v1/auth/me').flush(multiSchoolProfile);

      const user = service.user()!;
      expect(user.schoolId).toBeNull();
      expect(user.schools).toEqual([
        { id: 'school-1', name: 'School One' },
        { id: 'school-2', name: 'School Two' },
      ]);
    });
  });
});
