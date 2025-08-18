import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router'; // 👈 importa withHashLocation
import { routes } from './app.routes';
import {  withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';

// 🎫 BOLETOS
import { boletoReducer } from './state/boleto/boleto.reducer';
import { BoletoEffects } from './state/boleto/boleto.effects';

// 🧧 SORTEOS
import { sorteoReducer } from './state/sorteo/sorteo.reducer';
import { SorteoEffects } from './state/sorteo/sorteo.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()), // 👈 aquí activas hash (#)
    
    // 🧠 STORE
    provideStore({
      boleto: boletoReducer,
      sorteo: sorteoReducer,
    }),

    // 🧠 EFFECTS
    provideEffects([
      BoletoEffects,
      SorteoEffects,
    ]),

    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(),
  ],
};
