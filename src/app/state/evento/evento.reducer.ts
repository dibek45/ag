import { createReducer, on } from '@ngrx/store';
import * as EventoActions from './evento.actions';
import { Evento } from './evento.model';

export interface EventoState {
  eventos: Evento[];
  loading: boolean;
}

export const initialState: EventoState = {
  eventos: [],
  loading: false,
};

export const eventoReducer = createReducer(
  initialState,

  on(EventoActions.loadEventos, (state) => ({
    ...state,
    loading: true,
  })),

  on(EventoActions.loadEventosSuccess, (state, { eventos }) => ({
    ...state,
    eventos,   // 👈 aquí guarda los eventos
    loading: false,
  })),

  on(EventoActions.loadEventosFailure, (state) => ({
    ...state,
    eventos: [],
    loading: false,
  })),










  //cita



on(EventoActions.createCitaSuccess, (state, { eventoId, cita }) => ({
  ...state,
  eventos: state.eventos.map(ev =>
    ev.id === eventoId
      ? { ...ev, citas: [...(ev.citas || []), cita] }
      : ev
  )
})),


);
