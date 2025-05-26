import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// Simple auth service functionality
const getToken = (): string | null => {
  return localStorage.getItem(environment.tokenKey);
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
  localStorage.removeItem(environment.tokenKey);
  localStorage.removeItem('current_user');
  router.navigate(['/auth/login'], {
    queryParams: { expired: 'true' },
  });
};

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = getToken();

  console.log('TokenInterceptor - URL:', req.url);
  console.log('TokenInterceptor - Token available:', !!token);
  console.log('TokenInterceptor - Token length:', token?.length);

  if (token) {
    if (isTokenExpired(token)) {
      console.log('TokenInterceptor - Token is expired. Logging out...');
      handleExpiredToken(router);
      return throwError(() => new Error('Session expired'));
    }

    console.log('TokenInterceptor - Adding Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.log('TokenInterceptor - No token available');
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
