import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '@core/services/auth.service';

describe('authGuard', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should redirect to /login when not authenticated', () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should fetch current user when token exists but user not loaded', () => {
    localStorage.setItem('access_token', 'some-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(Observable);

    let guardResult: boolean | undefined;
    (result as Observable<boolean>).subscribe((v) => (guardResult = v));

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
          roles: [
            { roleId: 'r1', roleName: 'teacher', schoolId: 'school-1', schoolName: 'School One' },
          ],
          permissions: [],
        },
      });

    expect(guardResult).toBe(true);
    expect(TestBed.inject(AuthService).user()).toBeTruthy();
    expect(TestBed.inject(AuthService).user()!.schoolId).toBe('school-1');
  });

  it('should redirect to /login when fetchCurrentUser fails', () => {
    localStorage.setItem('access_token', 'expired-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    let guardResult: boolean | undefined;
    (result as Observable<boolean>).subscribe((v) => (guardResult = v));

    httpTesting
      .expectOne((r) => r.url === '/api/v1/auth/me')
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(guardResult).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access immediately when user is already loaded', () => {
    localStorage.setItem('access_token', 'some-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);

    // Login to populate user signal (login now chains /auth/me)
    const authService = TestBed.inject(AuthService);
    authService.login({ email: 'test@test.com', password: 'pass' }).subscribe();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/auth/login')
      .flush({
        success: true,
        data: {
          accessToken: 'some-token',
          refreshToken: 'refresh',
          user: {
            id: 'u1',
            email: 'test@test.com',
            roles: ['teacher'],
            permissions: [],
            schoolId: 's1',
            schools: [{ id: 's1', name: 'School One' }],
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
          roles: [{ roleId: 'r1', roleName: 'teacher', schoolId: 's1', schoolName: 'School One' }],
          permissions: [],
        },
      });

    // Now the guard should return true synchronously (no HTTP call)
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });
});
