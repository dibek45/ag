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


/// ✅ Effect corregido
createCita$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EventoActions.createCita),
    switchMap(({ eventoId, cita }) =>
      this.eventoService.createCita(cita).pipe(   // 👈 ya no se pasa eventoId al servicio
        map((newCita) =>
          EventoActions.createCitaSuccess({ eventoId, cita: newCita }) // 👈 aquí sí guardamos el eventoId en el store
        ),
        catchError((error) =>
          of(EventoActions.createCitaFailure({ error }))
        )
      )
    )
  )
);


}
