import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';

// 🧠 Reducers
import { empresaReducer } from './state/empresa/empresa.reducer';
import { eventoReducer } from './state/evento/evento.reducer';
import { authReducer } from './state/auth/auth.reducer';

// ⚡ Effects
import { EmpresaEffects } from './state/empresa/empresa.effects';
import { EventoEffects } from './state/evento/evento.effects';
import { AuthEffects } from './state/auth/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),

    // 🧠 STORE (reducers registrados)
    provideStore({
      empresas: empresaReducer,
      eventos: eventoReducer,
      auth: authReducer,
    }),

    // ⚡ EFFECTS (efectos globales)
    provideEffects([
      EmpresaEffects,
      EventoEffects,
      AuthEffects, // 👈 Manténlo aquí, no es opcional si usas persistencia
    ]),

    // 🧩 Herramientas Dev
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    // 🌐 HTTP
    provideHttpClient(),
  ],
};
