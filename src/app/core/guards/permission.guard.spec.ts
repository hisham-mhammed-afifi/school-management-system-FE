import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { permissionGuard } from './permission.guard';
import { PermissionService } from '@core/services/permission.service';

describe('permissionGuard', () => {
  let permissionService: PermissionService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    permissionService = TestBed.inject(PermissionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow access when user has the required permission', () => {
    vi.spyOn(permissionService, 'hasAnyPermission').mockReturnValue(true);
    const guard = permissionGuard('students.list');
    const result = TestBed.runInInjectionContext(() =>
      (guard as (...args: unknown[]) => boolean)({} as never, {} as never),
    );
    expect(result).toBe(true);
  });

  it('should deny access and navigate to /schools when permission is missing', () => {
    vi.spyOn(permissionService, 'hasAnyPermission').mockReturnValue(false);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const guard = permissionGuard('roles.delete');
    const result = TestBed.runInInjectionContext(() =>
      (guard as (...args: unknown[]) => boolean)({} as never, {} as never),
    );

    expect(result).toBe(false);
    expect(navSpy).toHaveBeenCalledWith(['/schools']);
  });
});
