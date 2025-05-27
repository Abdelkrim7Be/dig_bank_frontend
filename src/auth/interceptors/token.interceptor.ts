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
  console.log(
    'TokenInterceptor - Token preview:',
    token ? `${token.substring(0, 20)}...` : 'No token'
  );
  console.log('TokenInterceptor - LocalStorage contents:', {
    'digital-banking-token': localStorage.getItem('digital-banking-token'),
    current_user: localStorage.getItem('current_user'),
  });

  // Skip token for public auth endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('TokenInterceptor - Skipping token for public auth endpoint');
    return next(req);
  }

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
    console.log(
      'TokenInterceptor - Request headers after adding token:',
      req.headers.get('Authorization')
    );
  } else {
    console.log(
      'TokenInterceptor - No token available, request will be sent without Authorization header'
    );
  }

  return next(req).pipe(
    catchError((error) => {
      console.log('TokenInterceptor - Request failed:', {
        url: req.url,
        status: error.status,
        statusText: error.statusText,
        error: error.error,
      });

      if (error.status === 401) {
        console.log(
          'TokenInterceptor - 401 Unauthorized, handling token expiration'
        );
        if (error.error?.message === 'Token expired') {
          handleExpiredToken(router);
        }
      }

      if (error.status === 403) {
        console.log('TokenInterceptor - 403 Forbidden, possible token issue');
        console.log(
          'TokenInterceptor - Current token:',
          token ? 'Present' : 'Missing'
        );
        console.log(
          'TokenInterceptor - Request had Authorization header:',
          !!req.headers.get('Authorization')
        );
      }

      return throwError(() => error);
    })
  );
};
