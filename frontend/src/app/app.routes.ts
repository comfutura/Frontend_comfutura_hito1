// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-componente/login-componente';
import { DashboardComponent } from './pages/dashboard-componente/dashboard-componente';
import { CreateOtComponent } from './pages/ot-component/ot-component';
import { authGuard } from './auth/auth.guard';
import { LayoutComponent } from './component/layaout-component/layaout-component';



export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión'
  },
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard'
      },
      {
        path: 'ot',
        component: CreateOtComponent,
        title: 'Crear OT'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
