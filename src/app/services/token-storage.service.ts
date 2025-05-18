import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MOCK_DATA } from '../mocks/mock-data';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private TOKEN_KEY = 'auth-token';
  private USER_KEY = 'auth-user';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  signOut(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  public saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  public getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    // Return mock token during SSR
    return MOCK_DATA['auth'].token;
  }

  public saveUser(user: any): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (this.isBrowser) {
      const user = localStorage.getItem(this.USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
      return null;
    }
    // Return mock user during SSR
    return MOCK_DATA['auth'].user;
  }
}
