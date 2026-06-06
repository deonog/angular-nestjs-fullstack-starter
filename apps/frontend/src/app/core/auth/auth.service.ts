import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthUser, TokenResponse } from '@angular-nestjs-fullstack-starter/shared/types';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);

  readonly user = this.store.user;
  readonly isAuthenticated = this.store.isAuthenticated;

  init(): Promise<void> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return Promise.resolve();
    }

    return firstValueFrom(this.fetchProfile())
      .then((user) => this.store.setUser(user))
      .catch(() => this.clearSession());
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  register(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
      })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  refresh(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    const request$ = refreshToken
      ? this.http.post<void>(`${environment.apiUrl}/auth/logout`, {
          refreshToken,
        })
      : of(undefined);

    return request$.pipe(tap(() => this.clearSession()));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.store.clearUser();
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    void firstValueFrom(this.fetchProfile())
      .then((user) => this.store.setUser(user))
      .catch(() => this.clearSession());
  }

  private fetchProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/auth/me`);
  }
}
