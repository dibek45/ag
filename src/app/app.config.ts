import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';

// 🏢 EMPRESAS
import { empresaReducer } from './state/empresa/empresa.reducer';
import { EmpresaEffects } from './state/empresa/empresa.effects';
import { EventoEffects } from './state/evento/evento.effects';
import { eventoReducer } from './state/evento/evento.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),

    // 🧠 STORE
    provideStore({
      empresas: empresaReducer, 
            eventos: eventoReducer,    // 👈 agrega feature eventos
  // 👈 la clave debe coincidir con el createFeatureSelector('empresas')
    }),

    // 🧠 EFFECTS
    provideEffects([
      EmpresaEffects,
            EventoEffects,             // 👈 agrega efectos de eventos

    ]),

    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(),
  ],
};
