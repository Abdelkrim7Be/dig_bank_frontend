import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from auth service
  const token = authService.getToken();

  if (token) {
    // Check if token is expired
    if (isTokenExpired(token)) {
      handleExpiredToken(router);
      return throwError(() => new Error('Session expired'));
    }

    // Add token to request headers
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Handle 401 errors
      if (error.status === 401 && authService.isAuthenticated()) {
        // Auto logout if 401 response returned from api
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => error);
    })
  );
};

// Helper functions
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true;
  }
}

function handleExpiredToken(router: Router): void {
  alert('Your session has expired. Please log in again.');
  localStorage.removeItem('auth_token');
  router.navigate(['/login'], {
    // Changed from '/auth/login' to '/login'
    queryParams: { expired: 'true' },
  });
}
