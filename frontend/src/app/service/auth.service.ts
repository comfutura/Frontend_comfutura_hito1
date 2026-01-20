// src/app/core/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserJwtDto {
  idUsuario: number;
  idTrabajador: number;
  username: string;
  activo: boolean;
  roles: string[];
}

export interface AuthState {
  token: string | null;
  user: UserJwtDto | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';

  private authState = new BehaviorSubject<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false
  });

  public authState$ = this.authState.asObservable();

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return;

    const userData = this.decodeToken(token);
    if (!userData || this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    this.setAuthState(token, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.setToken(response.token)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearAuthState();
  }

  private setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.TOKEN_KEY, token);
    const userData = this.decodeToken(token);

    if (userData && !this.isTokenExpired(token)) {
      this.setAuthState(token, userData);
    } else {
      this.clearAuthState();
    }
  }

  private setAuthState(token: string, user: UserJwtDto): void {
    this.authState.next({
      token,
      user,
      isAuthenticated: true
    });
  }

  private clearAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.authState.next({
      token: null,
      user: null,
      isAuthenticated: false
    });
  }

  private decodeToken(token: string): UserJwtDto | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // Ajusta según tu estructura real del JWT
      // Ejemplos comunes: decoded.sub, decoded.data, decoded.usuario, etc.
      return (decoded.data as UserJwtDto) ?? (decoded as UserJwtDto) ?? null;
    } catch (e) {
      console.error('Error al decodificar token:', e);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  // ── Getters públicos ────────────────────────────────────────

  get currentUser(): UserJwtDto | null {
    const user = this.authState.value.user;
    const token = this.authState.value.token;

    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return user;
  }

  get currentTrabajadorId(): number | null {
    return this.currentUser?.idTrabajador ?? null;
  }

  get isAuthenticated(): boolean {
    const token = this.authState.value.token;
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return this.authState.value.isAuthenticated;
  }

  get token(): string | null {
    const t = this.authState.value.token;
    if (t && this.isTokenExpired(t)) {
      this.logout();
      return null;
    }
    return t;
  }

  // Opcional: método para refrescar el estado manualmente
  refreshAuthState(): void {
    this.loadInitialState();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Ocurrió un error inesperado';

    if (error.status === 401) {
      message = 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      message = 'No se pudo conectar al servidor. Verifica tu conexión.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.error?.error) {
      message = error.error.error;
    }

    return throwError(() => new Error(message));
  }
}
