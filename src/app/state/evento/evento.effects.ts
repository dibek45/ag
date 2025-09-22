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

  // 🔹 Cargar eventos de una empresa
  loadEventos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.loadEventos),
      switchMap(({ empresaId }) => {
        console.log("📡 Effect → Cargando eventos con empresaId:", empresaId);

        return this.eventoService.getEventosByAdmin(empresaId).pipe(
          map((eventos) =>
            EventoActions.loadEventosSuccess({ eventos, empresaId })
          ),
          catchError((error) =>
            of(EventoActions.loadEventosFailure({ error }))
          )
        );
      })
    )
  );

  // 🔹 Crear cita asociada a un evento
  createCita$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.createCita),
      switchMap(({ eventoId, cita }) =>
        this.eventoService.createCita(cita).pipe(
          map((newCita) =>
            EventoActions.createCitaSuccess({ eventoId, cita: newCita })
          ),
          catchError((error) =>
            of(EventoActions.createCitaFailure({ error }))
          )
        )
      )
    )
  );
}
