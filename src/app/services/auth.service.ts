import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          // Store the token in localStorage
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
          }
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          return throwError(
            () => new Error('Invalid credentials. Please try again.')
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    // Check if the token exists in localStorage
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
