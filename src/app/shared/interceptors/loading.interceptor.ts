import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';
import { AlertService } from '../services/alert.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Don't show loader for certain requests if needed
    // For example, background polling requests
    if (!request.url.includes('skip-loader')) {
      this.loaderService.show();
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        // Hide loader when the request is complete
        if (!request.url.includes('skip-loader')) {
          this.loaderService.hide();
        }
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An error occurred. Please try again later.';

    // Handle different types of errors
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      // Handle specific status codes
      switch (error.status) {
        case 0:
          errorMessage =
            'Unable to connect to the server. Please check your network connection.';
          break;
        case 400:
          errorMessage =
            error.error?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          // Optionally redirect to login page or refresh token
          break;
        case 403:
          errorMessage =
            'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage =
            'Internal server error. Please try again later or contact support.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          break;
      }
    }

    // Show error as alert
    this.alertService.error(errorMessage);

    // Log error to console in development
    console.error('HTTP Error:', error);
  }
}
