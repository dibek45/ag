import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as EventoActions from './evento.actions';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { EventoService } from './evento.service';

@Injectable()
export class EventoEffects {
  private actions$ = inject(Actions);
  private eventoService = inject(EventoService);

  loadEventos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.loadEventos),
      switchMap(() =>
        this.eventoService.getEventosByAdmin(1).pipe(
          map((eventos) =>
            EventoActions.loadEventosSuccess({ eventos })
          ),
          catchError((error) =>
            of(EventoActions.loadEventosFailure({ error }))
          )
        )
      )
    )
  );
}
