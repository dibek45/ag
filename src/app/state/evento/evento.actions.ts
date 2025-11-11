import { createAction, props } from '@ngrx/store';
import { Cita, Evento } from './evento.model';

// 🔄 Cargar eventos
export const loadEventos = createAction(
  '[Evento] Load Eventos',
  props<{ empresaId: number }>()
);

export const loadEventosSuccess = createAction(
  '[Evento] Load Eventos Success',
  props<{ eventos: Evento[]; empresaId: number }>()
);

export const loadEventosFailure = createAction(
  '[Evento] Load Eventos Failure',
  props<{ error: any }>()
);

// ➕ Crear evento
export const createEvento = createAction(
  '[Evento] Create Evento',
  props<{ evento: Evento; empresaId: number }>()
);

export const createEventoSuccess = createAction(
  '[Evento] Create Evento Success',
  props<{ evento: Evento; empresaId: number }>()
);

export const createEventoFailure = createAction(
  '[Evento] Create Evento Failure',
  props<{ error: any }>()
);

// ✏️ Actualizar evento
export const updateEvento = createAction(
  '[Evento] Update Evento',
  props<{ evento: Evento; empresaId: number }>()
);

export const updateEventoSuccess = createAction(
  '[Evento] Update Evento Success',
  props<{ evento: Evento; empresaId: number }>()
);

export const updateEventoFailure = createAction(
  '[Evento] Update Evento Failure',
  props<{ error: any }>()
);

// ❌ Eliminar evento
export const deleteEvento = createAction(
  '[Evento] Delete Evento',
  props<{ id: number; empresaId: number }>()
);

export const deleteEventoSuccess = createAction(
  '[Evento] Delete Evento Success',
  props<{ id: number; empresaId: number }>()
);

export const deleteEventoFailure = createAction(
  '[Evento] Delete Evento Failure',
  props<{ error: any }>()
);

// ➕ Crear cita
export const addCita = createAction(
  '[Cita] Add',
  props<{ empresaId: number; eventoId: number; cita: Cita }>()
);

export const addCitaSuccess = createAction(
  '[Cita] Add Success',
  props<{ empresaId: number; eventoId: number; cita: Cita }>()
);

export const addCitaFailure = createAction(
  '[Cita] Add Failure',
  props<{ error: any }>()
);

// ✏️ Actualizar cita
export const updateCita = createAction(
  '[Cita] Update',
  props<{ empresaId: number; eventoId: number; cita: Cita }>()
);

export const updateCitaSuccess = createAction(
  '[Cita] Update Success',
  props<{ empresaId: number; eventoId: number; cita: Cita }>()
);

export const updateCitaFailure = createAction(
  '[Cita] Update Failure',
  props<{ error: any }>()
);

// ❌ Eliminar cita
export const deleteCita = createAction(
  '[Cita] Delete',
  props<{ empresaId: number; eventoId: number; citaId: number }>()
);

export const deleteCitaSuccess = createAction(
  '[Cita] Delete Success',
  props<{ empresaId: number; eventoId: number; citaId: number }>()
);

export const deleteCitaFailure = createAction(
  '[Cita] Delete Failure',
  props<{ error: any }>()
);

// 🧹 Limpiar eventos (opcional al cambiar empresa)
export const clearEventos = createAction('[Evento] Clear Eventos');
