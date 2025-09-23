import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as EmpresaActions from './empresa.actions';
import { EmpresaService } from './empresa.service';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class EmpresaEffects {
  loadEmpresas$;
  loadEventosByEmpresa$;

  constructor(
    private actions$: Actions,
    private empresaService: EmpresaService
  ) {
    // 🔹 Empresas (mock del service)
    this.loadEmpresas$ = createEffect(() =>
      this.actions$.pipe(
        ofType(EmpresaActions.loadEmpresas),
        switchMap(() =>
          this.empresaService.getEmpresas().pipe(
            map((empresas) =>
              EmpresaActions.loadEmpresasSuccess({ empresas })
            ),
            catchError((error) =>
              of(EmpresaActions.loadEmpresasFailure({ error }))
            )
          )
        )
      )
    );

    // 🔹 Eventos de una empresa
    this.loadEventosByEmpresa$ = createEffect(() =>
      this.actions$.pipe(
        ofType(EmpresaActions.loadEventosByEmpresa),
        switchMap(({ empresaId }) =>
          this.empresaService.getEventosByEmpresa(empresaId).pipe(
            map((eventos) =>
              EmpresaActions.loadEventosByEmpresaSuccess({ empresaId, eventos })
            ),
            catchError((error) =>
              of(EmpresaActions.loadEventosByEmpresaFailure({ error }))
            )
          )
        )
      )
    );
  }
}
