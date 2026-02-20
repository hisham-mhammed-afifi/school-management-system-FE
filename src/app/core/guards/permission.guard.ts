import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/services/permission.service';

/**
 * Route guard factory that checks if the current user has at least one of the
 * required permissions. Super admins bypass all permission checks.
 *
 * Usage in routes:
 *   canActivate: [permissionGuard('students.list')]
 *   canActivate: [permissionGuard('roles.list', 'roles.create')]
 */
export function permissionGuard(...requiredPermissions: string[]): CanActivateFn {
  return () => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    if (permissionService.hasAnyPermission(...requiredPermissions)) {
      return true;
    }

    router.navigate(['/schools']);
    return false;
  };
}
