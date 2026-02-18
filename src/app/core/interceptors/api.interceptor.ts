import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@env';
import { AuthService } from '@core/services/auth.service';
import { SchoolService } from '@core/services/school.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for non-API requests (e.g. translation JSON files)
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const schoolService = inject(SchoolService);
  const token = authService.accessToken;

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const schoolId = schoolService.currentSchoolId();
  if (schoolId) {
    headers = headers.set('X-School-Id', schoolId);
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url.replace(/^\/api/, '')}`,
    headers,
  });

  return next(apiReq);
};
