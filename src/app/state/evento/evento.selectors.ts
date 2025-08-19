import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventoState } from './evento.reducer';
import { Evento } from './evento.model';

export const selectEventoState = createFeatureSelector<EventoState>('eventos');

export const selectAllEventos = createSelector(
  selectEventoState,
  (state: EventoState) => state.eventos
);

export const selectEventoById = (id: number) =>
  createSelector(selectAllEventos, (eventos) =>
    eventos.find((e) => e.id === id)
  );
export const selectEventosByAdmin = (adminId: number) =>
  createSelector(selectAllEventos, (eventos: Evento[]) =>
    eventos.filter((e) => e.admin?.id === adminId)
  );
export const selectEventosLoading = createSelector(
  selectEventoState,
  (state) => state.loading
);


