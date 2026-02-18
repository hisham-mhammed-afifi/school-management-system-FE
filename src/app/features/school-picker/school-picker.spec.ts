import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SchoolPickerComponent } from './school-picker';
import { AuthService } from '@core/services/auth.service';
import type { ApiResponse } from '@core/models/api';
import type { LoginResponse, UserProfile } from '@core/models/auth';

describe('SchoolPickerComponent', () => {
  let fixture: ComponentFixture<SchoolPickerComponent>;
  let component: SchoolPickerComponent;
  let httpTesting: HttpTestingController;
  let authService: AuthService;
  let router: Router;
  let originalMatchMedia: typeof window.matchMedia;

  const mockLoginResponse: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: '1',
        email: 'test@test.com',
        roles: ['teacher'],
        permissions: [],
        schoolId: null,
        schools: [],
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
      permissions: [],
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
      permissions: [],
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

  beforeEach(async () => {
    localStorage.clear();

    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [SchoolPickerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'schools/:schoolId', children: [{ path: '**', children: [] }] },
          { path: 'login', children: [] },
        ]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(SchoolPickerComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should redirect to login when no user', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(SchoolPickerComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should auto-redirect single-school user to their school', () => {
    loginAs(singleSchoolProfile);
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(SchoolPickerComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'school-1', 'dashboard']);
  });

  it('should show school list for multi-school user', () => {
    loginAs(multiSchoolProfile);

    fixture = TestBed.createComponent(SchoolPickerComponent);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.componentInstance.schools().length).toBe(2);

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[href]');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('should fetch platform schools for super admin', () => {
    loginAs(superAdminProfile);

    fixture = TestBed.createComponent(SchoolPickerComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(true);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush({
      success: true,
      data: [
        { id: 's1', name: 'School A' },
        { id: 's2', name: 'School B' },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.schools().length).toBe(2);
  });

  it('should auto-redirect super admin when only one platform school exists', () => {
    loginAs(superAdminProfile);
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(SchoolPickerComponent);
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush({
      success: true,
      data: [{ id: 'only-school', name: 'Only School' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'only-school', 'dashboard']);
  });
});
