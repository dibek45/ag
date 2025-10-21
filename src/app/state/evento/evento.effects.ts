import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, take, filter } from 'rxjs/operators';
import * as EventoActions from './evento.actions';
import { EventoService } from './evento.service';
import { Store } from '@ngrx/store';
import { selectEventosByEmpresaId } from './evento.selectors';
import { Cita } from './evento.model';

@Injectable()
export class EventoEffects {
  private actions$ = inject(Actions);
  private eventoService = inject(EventoService);
  private store = inject(Store);

  // 🔹 Cargar eventos (solo si no existen en el store)
  loadEventos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.loadEventos),
      withLatestFrom(this.store), // combina acción + estado
      switchMap(([action]) =>
        this.store.select(selectEventosByEmpresaId(action.empresaId)).pipe(
          take(1),
          filter(eventos => !eventos || eventos.length === 0), // evita recargar si ya existen
          switchMap(() =>
            this.eventoService.getEventosByAdmin(action.empresaId).pipe(
              map(eventos =>
                EventoActions.loadEventosSuccess({
                  eventos,
                  empresaId: action.empresaId
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
        this.eventoService.crearCita(cita).pipe(
          map((created: Cita) =>
            EventoActions.addCita({
              empresaId,
              eventoId,
              cita: created
            })
          ),
          catchError(error =>
            of(EventoActions.loadEventosFailure({ error }))
          )
        )
      )
    )
  );

  // ✏️ Actualizar cita
  updateCita$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventoActions.updateCita),
      switchMap(({ empresaId, eventoId, cita }) =>
        this.eventoService.actualizarCita(cita.id, cita).pipe(
          map(updated =>
            EventoActions.updateCita({
              empresaId,
              eventoId,
              cita: updated
            })
          ),
          catchError(error =>
            of(EventoActions.loadEventosFailure({ error }))
          )
        )
      )
    )
  );


  // ❌ Eliminar cita
deleteCita$ = createEffect(() =>
  this.actions$.pipe(
    ofType(EventoActions.deleteCita),
    switchMap(({ empresaId, eventoId, citaId }) =>
      this.eventoService.eliminarCita(citaId).pipe( // 👈 asegúrate de tener este método en tu servicio
        map(() =>
          EventoActions.deleteCita({
            empresaId,
            eventoId,
            citaId
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
