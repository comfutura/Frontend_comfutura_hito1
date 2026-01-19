// src/app/pages/dashboard-componente/dashboard-componente.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // ← IMPORTS CORRECTOS
import { AuthService } from '../../service/auth.service'; // ajusta la ruta si es necesario

@Component({
  selector: 'app-dashboard-componente',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './dashboard-componente.html',
  styleUrl: './dashboard-componente.css',
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos de ejemplo (más adelante vendrán de API)
  stats = signal([
    { title: 'Llamadas Hoy', value: '2,847', change: '+14%', icon: 'bi-telephone-inbound-fill', bg: 'bg-primary-subtle', text: 'text-primary' },
    { title: 'Ingresos Mensual', value: 'S/ 184,500', change: '+8.2%', icon: 'bi-currency-dollar', bg: 'bg-success-subtle', text: 'text-success' },
    { title: 'Incidentes Activos', value: '12', change: '-3', icon: 'bi-exclamation-triangle-fill', bg: 'bg-warning-subtle', text: 'text-warning' },
    { title: 'Clientes Activos', value: '4,821', change: '+47', icon: 'bi-people-fill', bg: 'bg-info-subtle', text: 'text-info' }
  ]);

  recentActivity = signal([
    { time: 'hace 5 min', action: 'Nueva llamada entrante', user: 'Juan Pérez' },
    { time: 'hace 12 min', action: 'Incidente resuelto', user: 'María López' },
    { time: 'hace 28 min', action: 'Pago recibido', user: 'Carlos Gómez' },
    { time: 'hace 45 min', action: 'Cliente nuevo registrado', user: 'Ana Torres' }
  ]);

  quickLinks = signal([
    { title: 'Registrar Llamada', icon: 'bi-telephone-plus', color: 'primary' },
    { title: 'Ver Reportes', icon: 'bi-graph-up', color: 'success' },
    { title: 'Gestión de Clientes', icon: 'bi-people', color: 'info' },
    { title: 'Alertas Técnicas', icon: 'bi-exclamation-octagon', color: 'danger' }
  ]);

  logout() {
    this.authService.logout();           // Limpia token y estado
    this.router.navigate(['/login']);    // Redirige al login
  }
}
