import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for non-API requests (e.g. translation JSON files)
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url.replace(/^\/api/, '')}`,
  });

  return next(apiReq);
};
