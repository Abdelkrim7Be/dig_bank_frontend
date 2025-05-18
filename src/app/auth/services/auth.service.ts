import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../models/auth.model';
import { User } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) {
    // Load user from local storage on service initialization
    const user = this.tokenService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Login user and store token
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, httpOptions)
      .pipe(
        tap((response) => {
          this.tokenService.saveToken(response.token);
          this.tokenService.saveUser(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message || 'Login failed. Please try again.'
              )
          );
        })
      );
  }

  /**
   * Register new user
   */
  register(user: RegisterRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, user, httpOptions)
      .pipe(
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message || 'Registration failed. Please try again.'
              )
          );
        })
      );
  }

  /**
   * Logout: remove token and user from storage
   */
  logout(): void {
    this.tokenService.signOut();
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  /**
   * Get token from storage
   */
  getToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Get current user info
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verify token validity by calling auth endpoint
   */
  verifyToken(): Observable<boolean> {
    const token = this.tokenService.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      map((user) => {
        this.currentUserSubject.next(user);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }
}
