// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';

// 📅 EVENTOS
import { eventoReducer } from './state/evento/evento.reducer';
import { EventoEffects } from './state/evento/evento.effects';

// (si más adelante quieres otros features, los agregas aquí)

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),

    // 🧠 STORE
    provideStore({
      eventos: eventoReducer, // 👈 clave debe coincidir con el featureSelector
    }),

    // 🧠 EFFECTS
    provideEffects([
      EventoEffects,
    ]),

    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(),
  ],
};
