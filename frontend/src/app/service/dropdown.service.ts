// src/app/core/services/dropdown.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment';

export interface DropdownItem {
  id: number;
  label: string;
}


@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  private apiUrl = `${environment.baseUrl}/api/dropdowns`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/clientes`);
  }

  getAreas(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/areas`);
  }

  getProyectos(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/proyectos`);
  }

  getFases(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/fases`);
  }

  getSites(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/sites`);
  }

  getRegiones(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/regiones`);
  }

  getOtsActivas(): Observable<DropdownItem[]> {
    return this.http.get<DropdownItem[]>(`${this.apiUrl}/ots`);
  }

}
