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
  });

  it('should pass through successful requests', () => {
    let result: unknown;
    http.get('/api/data').subscribe((res) => (result = res));

    const req = httpTesting.expectOne('/api/data');
    req.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('should navigate to /login on 401', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/api/data').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
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
});
