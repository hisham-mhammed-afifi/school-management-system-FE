import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  // TODO: inject your AuthService and check authentication state
  const isAuthenticated = false;

  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
