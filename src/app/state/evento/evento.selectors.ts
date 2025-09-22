import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventoState } from './evento.reducer';
import { Evento } from './evento.model';

// 👇 Debe coincidir con la clave usada en app.config.ts
export const selectEventoState = createFeatureSelector<EventoState>('eventos');

export const selectAllEventos = createSelector(
  selectEventoState,
  (state: EventoState) => state.eventos
);

export const selectEventoById = (id: number) =>
  createSelector(selectAllEventos, (eventos: Evento[]) =>
    eventos.find((e) => e.id === id)
  );

// 👇 Filtrar por empresaId (antes adminId)
export const selectEventosByEmpresaId = (empresaId: number) =>
  createSelector(selectAllEventos, (eventos: Evento[]): Evento[] =>
    eventos.filter(ev => ev.admin?.id === empresaId)
  );

export const selectEventosLoading = createSelector(
  selectEventoState,
  (state: EventoState) => state.loading
);
