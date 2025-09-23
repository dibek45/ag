import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as EventoActions from './evento.actions';
import { switchMap, map, catchError, withLatestFrom, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { EventoService } from './evento.service';
import { Store } from '@ngrx/store';
import { selectEventosByEmpresaId } from './evento.selectors';

@Injectable()
export class EventoEffects {
  actions$ = inject(Actions);
  eventoService = inject(EventoService);
  store = inject(Store);

  loadEventos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.loadEventos),             // 👈 aquí recibes "action"
      withLatestFrom(this.store),                   // 👈 une la acción con el estado
      switchMap(([action]) =>                       // 👈 ya puedes usar "action"
        this.store.select(selectEventosByEmpresaId(action.empresaId)).pipe(
          take(1),                                  // 👈 leer solo una vez
          filter(eventos => !eventos || eventos.length === 0),
          switchMap(() =>
            this.eventoService.getEventosByAdmin(action.empresaId).pipe(
              map((eventos) =>
                EventoActions.loadEventosSuccess({ eventos, empresaId: action.empresaId })
              ),
              catchError((error) =>
                of(EventoActions.loadEventosFailure({ error }))
              )
            )
          )
        )
      )
    )
  );
}
