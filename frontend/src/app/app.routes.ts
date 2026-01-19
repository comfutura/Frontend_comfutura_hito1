// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-componente/login-componente';
import { DashboardComponent } from './pages/dashboard-componente/dashboard-componente';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - Comfutura'
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard - Store Collection'
  },

  {
    path: '**',
    redirectTo: '/login'
  }
];
