import { createReducer, on } from '@ngrx/store';
import * as EventoActions from './evento.actions';
import { Evento, Cita } from './evento.model';

export interface EventoState {
  eventos: { [empresaId: number]: Evento[] }; // eventos agrupados por empresa
  loading: boolean;
  error: any;
}

export const initialState: EventoState = {
  eventos: {},
  loading: false,
  error: null,
};

export const eventoReducer = createReducer(
  initialState,

  // 🔹 Cargar eventos
  on(EventoActions.loadEventos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EventoActions.loadEventosSuccess, (state, { empresaId, eventos }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: eventos,
    },
    loading: false,
    error: null,
  })),

  on(EventoActions.loadEventosFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ➕ Crear evento
  on(EventoActions.createEventoSuccess, (state, { empresaId, evento }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: [...(state.eventos[empresaId] || []), evento],
    },
  })),

  // ✏️ Actualizar evento
  on(EventoActions.updateEventoSuccess, (state, { empresaId, evento }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: state.eventos[empresaId].map((e) =>
        e.id === evento.id ? { ...evento } : e
      ),
    },
  })),

  // ❌ Eliminar evento
  on(EventoActions.deleteEventoSuccess, (state, { empresaId, id }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: state.eventos[empresaId].filter((e) => e.id !== id),
    },
  })),

  // ➕ Agregar cita
  on(EventoActions.addCita, (state, { empresaId, eventoId, cita }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: state.eventos[empresaId].map((evento) =>
        evento.id === eventoId
          ? { ...evento, citas: [...(evento.citas || []), cita] }
          : evento
      ),
    },
  })),

  // ✏️ Actualizar cita
  on(EventoActions.updateCita, (state, { empresaId, eventoId, cita }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: state.eventos[empresaId].map((evento) =>
        evento.id === eventoId
          ? {
              ...evento,
              citas: evento.citas.map((c) =>
                c.id === cita.id ? { ...cita } : c
              ),
            }
          : evento
      ),
    },
  })),

  // ❌ Eliminar cita
  on(EventoActions.deleteCita, (state, { empresaId, eventoId, citaId }) => ({
    ...state,
    eventos: {
      ...state.eventos,
      [empresaId]: state.eventos[empresaId].map((evento) =>
        evento.id === eventoId
          ? {
              ...evento,
              citas: evento.citas.filter((c) => c.id !== citaId),
            }
          : evento
      ),
    },
  })),

  // 🧹 Limpiar eventos
  on(EventoActions.clearEventos, () => ({
    ...initialState,
  }))
);
