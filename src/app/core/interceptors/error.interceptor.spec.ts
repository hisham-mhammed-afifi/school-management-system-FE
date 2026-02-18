import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should pass through successful requests', () => {
    let result: unknown;
    http.get('/api/data').subscribe((res) => (result = res));

    const req = httpTesting.expectOne('/api/data');
    req.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('should navigate to /forbidden on 403', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/api/data').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should propagate the error to the subscriber', () => {
    let caughtError: unknown;

    http.get('/api/data').subscribe({
      error: (err) => (caughtError = err),
    });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(caughtError).toBeTruthy();
  });

  it('should attempt token refresh on 401 for non-auth requests', () => {
    localStorage.setItem('refresh_token', 'valid-refresh');

    http.get('/api/data').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Should attempt refresh
    const refreshReq = httpTesting.expectOne('/api/v1/auth/refresh');
    refreshReq.flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('should not attempt refresh on login 401', () => {
    http.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });

    // The URL includes /auth/login so it should NOT attempt refresh
    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // No refresh request should be made
    httpTesting.expectNone('/api/v1/auth/refresh');
  });
});
