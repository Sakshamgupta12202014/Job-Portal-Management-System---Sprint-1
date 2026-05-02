import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  // Attach Bearer token if available
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 503 Service Unavailable (Circuit Breaker Fallback)
      if (error.status === 503) {
        router.navigate(['/service-unavailable']);
        return throwError(() => error);
      }

      // On 401 → attempt token refresh, then retry original request
      if (error.status === 401 && token) {
        return authService.refresh().pipe(
          switchMap(refreshed => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${refreshed.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh also failed → logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
