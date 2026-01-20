// src/app/core/services/ot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment';

// ────────────────────────────────────────────────
// Interfaces de REQUEST (lo que envías al backend)
// ────────────────────────────────────────────────


// En ot.service.ts (o donde definas las interfaces)
export interface OtCreateRequest {
  ot: number;
  ceco: string;
  idCliente: number;
  idArea: number;
  idProyecto: number;     // ← agregar
  idFase: number;         // ← agregar
  idSite: number;         // ← agregar
  idRegion: number;       // ← agregar
  idOtsAnterior?: number | null;
  descripcion?: string;
  fechaApertura: string;
  diasAsignados?: number;
}
export interface OtTrabajadorRequest {
  idTrabajador: number;
  rolEnOt: string;               // máx 50 caracteres
}

export interface OtDetalleRequest {
  idMaestro: number;
  idProveedor: number;
  cantidad: number;              // BigDecimal → number en JS/TS
  precioUnitario: number;
}

export interface CrearOtCompletaRequest {
  ot: OtCreateRequest;
  trabajadores?: OtTrabajadorRequest[];   // puede ser vacío
  detalles?: OtDetalleRequest[];          // puede ser vacío
}

// ────────────────────────────────────────────────
// Interfaces de RESPONSE
// ────────────────────────────────────────────────

export interface OtResponse {
  idOts: number;
  ot: number;
  ceco: string;
  descripcion?: string;
  fechaApertura: string;
  diasAsignados: number;
  activo: boolean;
  fechaCreacion: string;         // ISO timestamp o similar
  // Puedes agregar más campos si amplías el mapToResponse en el backend
}

// ────────────────────────────────────────────────
// Servicio
// ────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class OtService {

  private apiUrl = `${environment.baseUrl}/api/ots`;  // Ej: http://localhost:8080/api/ots

  constructor(private http: HttpClient) {}

  /**
   * Crea una OT completa (OT + trabajadores + detalles)
   * Endpoint: POST /api/ots/completa
   */
  crearOtCompleta(payload: CrearOtCompletaRequest): Observable<OtResponse> {
    return this.http.post<OtResponse>(`${this.apiUrl}/completa`, payload).pipe(
      map(response => response), // puedes transformar aquí si necesitas
      catchError(this.handleError)
    );
  }

  /**
   * Versión simplificada: solo crea la OT base (sin trabajadores ni detalles)
   * Útil para pruebas o flujos parciales
   */
  crearOtBase(request: OtCreateRequest): Observable<OtResponse> {
    const payload: CrearOtCompletaRequest = {
      ot: request,
      trabajadores: [],
      detalles: []
    };
    return this.crearOtCompleta(payload);
  }

  // Manejo básico de errores (puedes personalizarlo mucho más)
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del backend
      if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 409 || error.status === 422) {
        errorMessage = error.error?.message || 'Conflicto (posible OT duplicada)';
      } else {
        errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
      }
    }

    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
