import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '@core/services/auth.service';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should not modify non-API requests', () => {
    http.get('./assets/i18n/en.json').subscribe();

    const req = httpTesting.expectOne('./assets/i18n/en.json');
    expect(req.request.url).toBe('./assets/i18n/en.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should rewrite /api requests to the environment API URL', () => {
    http.get('/api/users').subscribe();

    // environment.apiUrl is 'http://localhost:3000/api' in dev
    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.url).toBe('http://localhost:3000/api/users');
    req.flush([]);
  });

  it('should strip the /api prefix and append to apiUrl', () => {
    http.get('/api/users/123/profile').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users/123/profile');
    expect(req.request.url).toContain('/users/123/profile');
    req.flush({});
  });

  it('should attach Authorization header when token exists', () => {
    localStorage.setItem('access_token', 'my-jwt-token');

    // Re-create TestBed so AuthService picks up the token
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('should not attach Authorization header when no token exists', () => {
    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should attach X-School-Id header when school is selected by super admin', () => {
    localStorage.setItem('access_token', 'my-jwt-token');
    localStorage.setItem('selected_school_id', 'school-123');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);

    // Log in as a super admin (schoolId: null) so currentSchoolId uses the stored value
    const authService = TestBed.inject(AuthService);
    authService.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
    const loginReq = httpTesting.expectOne('http://localhost:3000/api/v1/auth/login');
    loginReq.flush({
      success: true,
      data: {
        accessToken: 'my-jwt-token',
        refreshToken: 'refresh',
        user: {
          id: 'u1',
          email: 'admin@test.com',
          roles: ['super_admin'],
          permissions: [],
          schoolId: null,
        },
      },
    });

    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.get('X-School-Id')).toBe('school-123');
    req.flush([]);
  });

  it('should not attach X-School-Id header when no school is selected', () => {
    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.has('X-School-Id')).toBe(false);
    req.flush([]);
  });
});
