import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SchoolService } from '@core/services/school.service';

/**
 * Validates that the :schoolId in the route is accessible to the current user.
 * - Super admins can access any school
 * - Regular users can only access schools they have roles in
 * - Redirects to /schools if the school is not accessible
 */
export const schoolContextGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const schoolService = inject(SchoolService);
  const router = inject(Router);

  const user = authService.user();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const schoolId = route.paramMap.get('schoolId');
  if (!schoolId) {
    router.navigate(['/schools']);
    return false;
  }

  // Super admins can access any school
  if (schoolService.isSuperAdmin()) {
    return true;
  }

  // Regular users can only access their assigned schools
  const hasAccess = user.schools.some((s) => s.id === schoolId);
  if (!hasAccess) {
    // Redirect to their default school or the school picker
    if (user.schools.length === 1) {
      router.navigate(['/schools', user.schools[0].id, 'dashboard']);
    } else {
      router.navigate(['/schools']);
    }
    return false;
  }

  return true;
};
