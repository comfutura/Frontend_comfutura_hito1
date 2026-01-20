// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(auth => {
      if (auth.isAuthenticated) {
        return true;
      }

      // Guardamos la URL completa que el usuario intentó acceder
      const returnUrl = state.url;

      router.navigate(['/login'], {
        queryParams: { returnUrl }
      });

      return false;
    })
  );
};
