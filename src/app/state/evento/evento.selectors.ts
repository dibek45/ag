import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventoState } from './evento.reducer';
import { Evento } from './evento.model';
export const selectEventoState =
  createFeatureSelector<EventoState>('eventos'); // ✅ no 'evento'

export const selectAllEventos = createSelector(
  selectEventoState,
  (state: EventoState) =>
    Object.values(state.eventos).flat() // aplanamos todas las empresas
);



export const selectEventoById = (empresaId: number, id: number) =>
  createSelector(selectEventosByEmpresaId(empresaId), (eventos: Evento[]) =>
    eventos.find((e) => e.id === id)
  );

export const selectEventosLoading = createSelector(
  selectEventoState,
  (state: EventoState) => state.loading
);

export const selectEventosByEmpresaId = (empresaId: number) =>
  createSelector(selectEventoState, (state: EventoState) =>
    state.eventos[empresaId] || []
  );
