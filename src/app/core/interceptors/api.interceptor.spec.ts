import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'schools/:schoolId', children: [{ path: '**', children: [] }] },
          { path: '**', children: [] },
        ]),
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

  it('should attach X-School-Id header when on a school route', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/school-123/users');

    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.get('X-School-Id')).toBe('school-123');
    req.flush([]);
  });

  it('should not attach X-School-Id header when not on a school route', () => {
    http.get('/api/users').subscribe();

    const req = httpTesting.expectOne('http://localhost:3000/api/users');
    expect(req.request.headers.has('X-School-Id')).toBe(false);
    req.flush([]);
  });
});
