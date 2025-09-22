import { createReducer, on } from '@ngrx/store';
import * as EventoActions from './evento.actions';
import { Evento } from './evento.model';

export interface EventoState {
  eventos: Evento[];   // aquí guardamos todos los eventos (de varios adminId)
  loading: boolean;
}

export const initialState: EventoState = {
  eventos: [],
  loading: false,
};

export const eventoReducer = createReducer(
  initialState,

  // 🚀 cuando empieza la carga
  on(EventoActions.loadEventos, (state) => ({
    ...state,
    loading: true,
  })),

  // 🚀 cuando carga bien
  on(EventoActions.loadEventosSuccess, (state, { eventos, empresaId }) => {
    // eliminamos los eventos de ese adminId que ya existían
    const filtrados = state.eventos.filter(e => e.admin.id !== empresaId);

    return {
      ...state,
      eventos: [...filtrados, ...eventos], // añadimos los nuevos
      loading: false,
    };
  }),

  // 🚀 cuando falla la carga
  on(EventoActions.loadEventosFailure, (state) => ({
    ...state,
    loading: false,
  })),

  // 🚀 cuando se crea una cita dentro de un evento
  on(EventoActions.createCitaSuccess, (state, { eventoId, cita }) => ({
    ...state,
    eventos: state.eventos.map(ev =>
      ev.id === eventoId
        ? { ...ev, citas: [...(ev.citas || []), cita] }
        : ev
    ),
  }))
);
