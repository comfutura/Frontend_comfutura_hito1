// src/app/core/services/auth.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // ← IMPORTANTE
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserJwtDto {
  id: number;
  username: string;
  activo: boolean;
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
  private platformId = inject(PLATFORM_ID); // ← detecta si es browser o server

  private readonly API_URL = `http://localhost:8080/api/auth`;

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
    // Solo en navegador (cliente)
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = this.decodeToken(token);
        if (userData) {
          this.setAuthState(token, userData);
        } else {
          this.clearAuthState();
        }
      }
    }
    // En servidor: se queda con estado inicial vacío → correcto
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
    // Solo guarda en localStorage si estamos en navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
    const userData = this.decodeToken(token);
    if (userData) {
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
    // Solo limpia localStorage en navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
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
      return (decoded.data as UserJwtDto) ?? null;
    } catch (e) {
      console.error('Error al decodificar token:', e);
      return null;
    }
  }

  // Getters
  get currentUser(): UserJwtDto | null {
    return this.authState.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  get token(): string | null {
    return this.authState.value.token;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error.status === 401) {
      message = 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.error?.error) {
      message = error.error.error;
    } else if (error.message) {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }
}
