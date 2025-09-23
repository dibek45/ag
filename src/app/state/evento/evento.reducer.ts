import { createReducer, on } from '@ngrx/store';
import * as EventoActions from './evento.actions';
import { Evento } from './evento.model';

export interface EventoState {
  eventos: { [empresaId: number]: Evento[] }; // 👈 diccionario por empresa
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

on(EventoActions.loadEventosSuccess, (state, { eventos, empresaId }) => ({
  ...state,
  eventos: {
    ...state.eventos,
    [empresaId]: eventos  // 👈 ahora cada empresa tiene su array independiente
  },
  loading: false,
  error: null
}))

);
