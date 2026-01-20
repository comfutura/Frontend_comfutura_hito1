// src/app/components/layout/layout.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,                 // recomendado en Angular 17+
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layaout-component.html',
  styleUrl: './layaout-component.css',
})
export class LayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  username = 'Usuario'; // ← reemplaza con authService.getUserName() o similar

logout() {
    this.authService.logout();           // Limpia token y estado
    this.router.navigate(['/login']);    // Redirige al login
  }
}
