import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_DATA } from './mock-data';
import { environment } from '../../environments/environment';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip if mocking is disabled in environment
    if (!environment.useMockApi) {
      return next.handle(request);
    }

    // Only intercept API requests
    if (!request.url.includes('/api/')) {
      return next.handle(request);
    }

    // Add artificial network delay to simulate real API
    const delay_ms = 500;

    // Get the endpoint path
    const apiEndpoint = this.getEndpoint(request.url);

    // Check if we have mock data for this endpoint
    if (MOCK_DATA[apiEndpoint as keyof typeof MOCK_DATA]) {
      console.log(`[MockAPI] Intercepted request to ${apiEndpoint}`);
      return of(
        new HttpResponse({
          status: 200,
          body: this.processRequest(request, apiEndpoint),
        })
      ).pipe(delay(delay_ms));
    }

    // If POST to a specific endpoint like login
    if (request.method === 'POST' && apiEndpoint === '/api/auth/login') {
      const body = request.body;
      if (body && body.username === 'user' && body.password === 'password') {
        return of(
          new HttpResponse({
            status: 200,
            body: {
              token: 'mock-jwt-token',
              userId: 101,
              username: body.username,
            },
          })
        ).pipe(delay(delay_ms));
      } else {
        return of(
          new HttpResponse({
            status: 401,
            body: { message: 'Invalid credentials' },
          })
        ).pipe(delay(delay_ms));
      }
    }

    // For unhandled endpoints, pass through to the next handler
    console.log(`[MockAPI] No mock data for ${apiEndpoint}, passing through`);
    return next.handle(request);
  }

  private getEndpoint(url: string): string {
    // Extract the API endpoint path from the full URL
    const apiPathMatch = url.match(/\/api\/[^?]*/);
    return apiPathMatch ? apiPathMatch[0] : url;
  }

  private processRequest(request: HttpRequest<any>, endpoint: string): any {
    // Handle different HTTP methods
    switch (request.method) {
      case 'GET':
        return MOCK_DATA[endpoint as keyof typeof MOCK_DATA];

      case 'POST':
        // For simplicity, we're returning predetermined responses
        // In a more complex setup, you could modify the mock data based on the request body
        return (
          MOCK_DATA[endpoint as keyof typeof MOCK_DATA] || {
            id: new Date().getTime(),
            success: true,
          }
        );

      case 'PUT':
        return {
          ...MOCK_DATA[endpoint as keyof typeof MOCK_DATA],
          ...request.body,
          updated: true,
        };

      case 'DELETE':
        return { success: true };

      default:
        return MOCK_DATA[endpoint as keyof typeof MOCK_DATA];
    }
  }
}
