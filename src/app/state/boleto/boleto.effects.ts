import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { isPlatformBrowser } from '@angular/common';
import { BoletoService } from './boleto.service';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { of, EMPTY, from } from 'rxjs';
import { Action } from '@ngrx/store';              // 👈 importa Action
import * as BoletoActions from './boleto.actions';
import * as SorteoActions from '../sorteo/sorteo.actions';

@Injectable()
export class BoletoEffects {
  private platformId = inject(PLATFORM_ID);
  private actions$ = inject(Actions);

  constructor(private boletoService: BoletoService) {}



   loadBoletos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoletoActions.loadBoletos),
      mergeMap(({ sorteoId }) => {
        if (!isPlatformBrowser(this.platformId)) {
          console.log('🚫 SSR: efecto de boletos cancelado');
          return EMPTY;
        }

        return this.boletoService.getBoletos(sorteoId).pipe(
          map((boletos) =>
            BoletoActions.loadBoletosSuccess({ sorteoId, boletos })
          ),
          catchError((error) => {
            console.error('[Boleto API] Error:', error);
            return of({ type: '[Boleto API] Load Failed' });
          })
        );
      })
    )
  );
}
