import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

// We'll create a simple auth service method for now, without using @auth0/angular-jwt
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const isTokenExpired = (token: string): boolean => {
  try {
    // Simple token expiration check without using @auth0/angular-jwt
    // Decode JWT token to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds

    // Check if token is expired
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    // If we can't parse the token, assume it's expired for safety
    return true;
  }
};

const handleExpiredToken = (router: Router): void => {
  // Display alert about session expiration
  alert('Your session has expired. Please log in again.');

  // Logout
  localStorage.removeItem('auth_token');

  // Redirect to login page
  router.navigate(['/login'], {
    queryParams: { expired: 'true' },
  });
};

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Check if we have a token
  const token = getToken();

  if (token) {
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token is expired. Logging out...');
      handleExpiredToken(router);
      return throwError(() => new Error('Session expired'));
    }

    // Add token to request
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Continue with the modified request
  return next(req).pipe(
    catchError((error) => {
      // If we receive a 401 Unauthorized response, the token might be expired
      if (error.status === 401) {
        if (error.error && error.error.message === 'Token expired') {
          handleExpiredToken(router);
        }
      }

      return throwError(() => error);
    })
  );
};
