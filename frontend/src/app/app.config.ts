import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import {
  provideHttpClient,
  withFetch,
} from '@angular/common/http';

// Import necesario para ng2-charts (registra controladores, escalas, etc.)
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    // Manejo de errores globales en browser (opcional pero útil)
    // provideBrowserGlobalErrorListeners(),  // ← comentado porque es experimental/raro usarlo

    // Optimización de change detection (recomendado en Angular 17+)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Enrutamiento
    provideRouter(routes),

    // Hydration para SSR (ya lo tienes, con event replay para mejorar UX)
    provideClientHydration(withEventReplay()),

    // HttpClient con fetch (mejor performance que XMLHttpRequest)
    provideHttpClient(withFetch()),

    // Registro global de componentes de Chart.js (necesario para bar, pie, etc.)
    provideCharts(withDefaultRegisterables()),
  ],
};
