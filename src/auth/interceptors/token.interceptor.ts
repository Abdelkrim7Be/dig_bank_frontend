import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Simple auth service functionality
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true;
  }
};

const handleExpiredToken = (router: Router): void => {
  alert('Your session has expired. Please log in again.');
  localStorage.removeItem('auth_token');
  router.navigate(['/auth/login'], {
    queryParams: { expired: 'true' },
  });
};

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = getToken();

  if (token) {
    if (isTokenExpired(token)) {
      console.log('Token is expired. Logging out...');
      handleExpiredToken(router);
      return throwError(() => new Error('Session expired'));
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        if (error.error?.message === 'Token expired') {
          handleExpiredToken(router);
        }
      }
      return throwError(() => error);
    })
  );
};
