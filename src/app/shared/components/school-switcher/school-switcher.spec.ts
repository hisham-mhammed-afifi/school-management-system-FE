import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SchoolSwitcherComponent } from './school-switcher';
import { SchoolService } from '@core/services/school.service';
import { AuthService } from '@core/services/auth.service';
import type { ApiResponse } from '@core/models/api';
import type { LoginResponse, UserProfile } from '@core/models/auth';

describe('SchoolSwitcherComponent', () => {
  let fixture: ComponentFixture<SchoolSwitcherComponent>;
  let component: SchoolSwitcherComponent;
  let httpTesting: HttpTestingController;
  let schoolService: SchoolService;
  let authService: AuthService;
  let router: Router;

  const mockLoginResponse: ApiResponse<LoginResponse> = {
    success: true,
    data: {
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: '1',
        email: 'admin@test.com',
        roles: ['super_admin'],
        permissions: ['*'],
        schoolId: null,
        schools: [],
      },
    },
  };

  const mockSuperAdminProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '1',
      email: 'admin@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [{ roleId: 'r1', roleName: 'super_admin', schoolId: null, schoolName: null }],
      permissions: ['*'],
    },
  };

  const mockMultiSchoolProfile: ApiResponse<UserProfile> = {
    success: true,
    data: {
      id: '2',
      email: 'teacher@test.com',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      roles: [
        { roleId: 'r1', roleName: 'teacher', schoolId: 's1', schoolName: 'School One' },
        { roleId: 'r2', roleName: 'examiner', schoolId: 's2', schoolName: 'School Two' },
      ],
      permissions: ['read:students'],
    },
  };

  const mockSchoolsResponse = {
    success: true,
    data: [
      { id: 's1', name: 'School One' },
      { id: 's2', name: 'School Two' },
    ],
    meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
  };

  function loginAs(profile: ApiResponse<UserProfile>): void {
    authService.login({ email: 'a@b.com', password: 'pass' }).subscribe();
    httpTesting.expectOne('/api/v1/auth/login').flush(mockLoginResponse);
    httpTesting.expectOne('/api/v1/auth/me').flush(profile);
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SchoolSwitcherComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    schoolService = TestBed.inject(SchoolService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SchoolSwitcherComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch platform schools on init for super admin', () => {
    loginAs(mockSuperAdminProfile);

    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    expect(req.request.method).toBe('GET');
    req.flush(mockSchoolsResponse);

    expect(schoolService.schools().length).toBe(2);
  });

  it('should not fetch platform schools for regular multi-school user', () => {
    loginAs(mockMultiSchoolProfile);

    fixture.detectChanges();

    httpTesting.expectNone('/api/v1/platform/schools');
    expect(schoolService.schools().length).toBe(2);
  });

  it('should render select with school options', () => {
    loginAs(mockMultiSchoolProfile);

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select');
    expect(select).toBeTruthy();

    const options = el.querySelectorAll('option');
    expect(options.length).toBe(3); // placeholder + 2 schools
  });

  it('should navigate to new school URL on change', async () => {
    loginAs(mockMultiSchoolProfile);

    await router.navigateByUrl('/schools/s1/dashboard');
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    component.onSchoolChange({ target: { value: 's2' } } as unknown as Event);

    expect(navigateSpy).toHaveBeenCalledWith('/schools/s2/dashboard');
  });

  it('should navigate to school dashboard when not already in a school route', () => {
    loginAs(mockMultiSchoolProfile);
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onSchoolChange({ target: { value: 's1' } } as unknown as Event);

    expect(navigateSpy).toHaveBeenCalledWith(['/schools', 's1', 'dashboard']);
  });

  it('should have aria-label on select', () => {
    loginAs(mockMultiSchoolProfile);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select');
    expect(select?.getAttribute('aria-label')).toBeTruthy();
  });
});
