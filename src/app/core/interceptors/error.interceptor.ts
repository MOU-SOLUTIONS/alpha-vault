import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * HTTP Error Interceptor
 * Handles 401 (Unauthorized) and 403 (Forbidden) errors by logging out the user
 * and redirecting to the login page.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        // Clear authentication data
        authService.logout();
        
        // Redirect to login page
        router.navigate(['/auth/login'], {
          queryParams: { 
            returnUrl: router.url,
            expired: 'true'
          }
        });
      }

      // Re-throw the error so components can still handle it
      return throwError(() => error);
    })
  );
};

