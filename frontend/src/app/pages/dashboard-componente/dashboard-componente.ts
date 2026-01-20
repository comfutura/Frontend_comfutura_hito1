import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-componente.html',
  styleUrl: './dashboard-componente.css',
})
export class DashboardComponent {
  stats = signal({
    otPendientes: 18,
    otCompletadas: 47,
    usuariosActivos: 132,
    eficiencia: 92
  });

  totalOt = computed(() => this.stats().otPendientes + this.stats().otCompletadas);
}
