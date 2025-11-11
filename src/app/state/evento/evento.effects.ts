import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, take, filter } from 'rxjs/operators';
import * as EventoActions from './evento.actions';
import { EventoService } from './evento.service';
import { CitaService } from './../servicios/cita.service';
import { Store } from '@ngrx/store';
import { selectEventosByEmpresaId } from './evento.selectors';
import { Cita } from './evento.model';

@Injectable()
export class EventoEffects {
  private actions$ = inject(Actions);
  private eventoService = inject(EventoService);
  private citaService = inject(CitaService);
  private store = inject(Store);

  // 🔹 Cargar eventos
  loadEventos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.loadEventos),
      withLatestFrom(this.store),
      switchMap(([action]) =>
        this.store.select(selectEventosByEmpresaId(action.empresaId)).pipe(
          take(1),
          filter(eventos => !eventos || eventos.length === 0),
          switchMap(() =>
            this.eventoService.getEventosByAdmin(action.empresaId).pipe(
              map(eventos =>
                EventoActions.loadEventosSuccess({
                  eventos,
                  empresaId: action.empresaId,
                })
              ),
              catchError(error =>
                of(EventoActions.loadEventosFailure({ error }))
              )
            )
          )
        )
      )
    )
  );

  // ➕ Crear evento
  createEvento$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.createEvento),
      switchMap(({ evento, empresaId }) =>
        this.eventoService.crearEvento(evento).pipe(
          map(created =>
            EventoActions.createEventoSuccess({ evento: created, empresaId })
          ),
          catchError(error =>
            of(EventoActions.createEventoFailure({ error }))
          )
        )
      )
    )
  );

  // ✏️ Actualizar evento
  updateEvento$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.updateEvento),
      switchMap(({ evento, empresaId }) =>
        this.eventoService.actualizarEvento(evento.id, evento).pipe(
          map(updated =>
            EventoActions.updateEventoSuccess({ evento: updated, empresaId })
          ),
          catchError(error =>
            of(EventoActions.updateEventoFailure({ error }))
          )
        )
      )
    )
  );

  // ❌ Eliminar evento
  deleteEvento$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.deleteEvento),
      switchMap(({ id, empresaId }) =>
        this.eventoService.eliminarEvento(id).pipe(
          map(() =>
            EventoActions.deleteEventoSuccess({ id, empresaId })
          ),
          catchError(error =>
            of(EventoActions.deleteEventoFailure({ error }))
          )
        )
      )
    )
  );

 // ➕ Crear cita
addCita$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EventoActions.addCita),
    switchMap(({ empresaId, eventoId, cita }) =>
      this.citaService.crearCita(cita).pipe(
        map((created: Cita) =>
          EventoActions.addCitaSuccess({
            empresaId,
            eventoId,
            cita: created,
          })
        ),
        catchError(error =>
          of(EventoActions.updateCitaFailure({ error }))
        )
      )
    )
  )
);

 updateCita$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EventoActions.updateCita),
    switchMap(({ empresaId, eventoId, cita }) =>
      this.citaService.actualizarCita(cita.id, cita).pipe(
        map(updated =>
          EventoActions.updateCitaSuccess({
            empresaId,
            eventoId,
            cita: updated
          })
        ),
        catchError(error =>
          of(EventoActions.updateCitaFailure({ error }))
        )
      )
    )
  )
);


  // ❌ Eliminar cita (usa deleteCitaSuccess para no recursar)
  deleteCita$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.deleteCita),
      switchMap(({ empresaId, eventoId, citaId }) =>
        this.citaService.eliminarCita(citaId).pipe(
          map(() =>
            EventoActions.deleteCitaSuccess({
              empresaId,
              eventoId,
              citaId,
            })
          ),
          catchError(error =>
            of(EventoActions.loadEventosFailure({ error }))
          )
        )
      )
    )
  );
}
