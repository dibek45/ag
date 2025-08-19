import { createAction, props } from '@ngrx/store';
import { Evento } from './evento.model';

// 🔄 Cargar todos los eventos
export const loadEventos = createAction(
  '[Evento] Load Eventos',
  props<{ adminId: number }>()
);export const loadEventosSuccess = createAction(
  '[Evento] Load Eventos Success',
  props<{ eventos: Evento[] }>()
);
export const loadEventosFailure = createAction(
  '[Evento] Load Eventos Failure',
  props<{ error: any }>()
);

// ➕ Crear evento
export const createEvento = createAction(
  '[Evento] Create Evento',
  props<{ evento: Evento }>()
);
export const createEventoSuccess = createAction(
  '[Evento] Create Evento Success',
  props<{ evento: Evento }>()
);
export const createEventoFailure = createAction(
  '[Evento] Create Evento Failure',
  props<{ error: any }>()
);

// ✏️ Actualizar evento
export const updateEvento = createAction(
  '[Evento] Update Evento',
  props<{ evento: Evento }>()
);
export const updateEventoSuccess = createAction(
  '[Evento] Update Evento Success',
  props<{ evento: Evento }>()
);
export const updateEventoFailure = createAction(
  '[Evento] Update Evento Failure',
  props<{ error: any }>()
);

// ❌ Eliminar evento
export const deleteEvento = createAction(
  '[Evento] Delete Evento',
  props<{ id: number }>()
);
export const deleteEventoSuccess = createAction(
  '[Evento] Delete Evento Success',
  props<{ id: number }>()
);
export const deleteEventoFailure = createAction(
  '[Evento] Delete Evento Failure',
  props<{ error: any }>()
);
