import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../features/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = authService.getAccessToken();
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh');

      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((tokens) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            }),
          ),
        ),
        catchError(() => {
          authService.clearSession();
          void router.navigate(['/auth/login']);
          return throwError(() => error);
        }),
      );
    }),
  );
};
