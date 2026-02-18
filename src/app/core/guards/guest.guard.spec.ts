import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow access when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to /schools when authenticated', () => {
    localStorage.setItem('access_token', 'some-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/schools']);
  });
});
