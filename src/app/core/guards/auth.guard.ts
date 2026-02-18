import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Token exists but user not yet loaded (e.g. page refresh) — fetch before rendering
  if (!authService.user()) {
    return authService.fetchCurrentUser().pipe(
      map(() => true),
      catchError(() => {
        authService.clearSession();
        router.navigate(['/login']);
        return of(false);
      }),
    );
  }

  return true;
};
