import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, TokenResponse } from '../../shared/models/auth.model';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthUser | null>(null);

  readonly user = this.session.asReadonly();
  readonly isAuthenticated = computed(() => this.session() !== null);

  init(): Promise<void> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return Promise.resolve();
    }

    return firstValueFrom(this.fetchProfile())
      .then((user) => this.session.set(user))
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
    this.session.set(null);
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    void firstValueFrom(this.fetchProfile())
      .then((user) => this.session.set(user))
      .catch(() => this.clearSession());
  }

  private fetchProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/auth/me`);
  }
}
