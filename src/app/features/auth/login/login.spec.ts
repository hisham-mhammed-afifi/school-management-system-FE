import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let httpTesting: HttpTestingController;
  let router: Router;
  let originalMatchMedia: typeof window.matchMedia;

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
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render login form', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();

    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should submit login request with valid credentials', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.form.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.loading()).toBe(true);

    const req = httpTesting.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      data: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: '1', email: 'test@example.com', roles: [], permissions: [], schoolId: null },
      },
    });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error on login failure', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      email: 'test@example.com',
      password: 'wrong',
    });

    fixture.componentInstance.onSubmit();

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush(
      {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.errorMessage()).toBe('Invalid email or password');
  });
});
