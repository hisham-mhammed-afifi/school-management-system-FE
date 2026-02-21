import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, switchMap, map, shareReplay } from 'rxjs';

import type { ApiResponse } from '@core/models/api';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserProfile,
} from '@core/models/auth';
import { mapProfileToAuthUser } from '@core/models/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _accessToken = signal<string | null>(this.loadToken(ACCESS_TOKEN_KEY));
  private _refreshingToken: Observable<ApiResponse<RefreshTokenResponse>> | null = null;

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());

  get accessToken(): string | null {
    return this._accessToken();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', credentials).pipe(
      tap((res) => {
        this.storeTokens(res.data.accessToken, res.data.refreshToken);
      }),
      switchMap((loginRes) => this.fetchCurrentUser().pipe(map(() => loginRes))),
    );
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenResponse>> {
    if (this._refreshingToken) {
      return this._refreshingToken;
    }

    const refreshToken = this.loadToken(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token'));
    }

    const body: RefreshTokenRequest = { refreshToken };
    this._refreshingToken = this.http
      .post<ApiResponse<RefreshTokenResponse>>('/api/v1/auth/refresh', body)
      .pipe(
        tap((res) => {
          this._accessToken.set(res.data.accessToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
          this._refreshingToken = null;
        }),
        catchError((err) => {
          this._refreshingToken = null;
          this.clearSession();
          return throwError(() => err);
        }),
        shareReplay(1),
      );

    return this._refreshingToken;
  }

  fetchCurrentUser(): Observable<ApiResponse<UserProfile>> {
    return this.http
      .get<ApiResponse<UserProfile>>('/api/v1/auth/me')
      .pipe(tap((res) => this._user.set(mapProfileToAuthUser(res.data))));
  }

  logout(): void {
    this.http.post('/api/v1/auth/logout', {}).subscribe({
      error: () => {
        /* Server-side cleanup is best-effort */
      },
    });
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    this._accessToken.set(accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private loadToken(key: string): string | null {
    return localStorage.getItem(key);
  }
}
