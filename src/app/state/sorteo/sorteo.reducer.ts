import { createReducer, on } from '@ngrx/store';
import * as SorteoActions from './sorteo.actions';
import { Sorteo } from './sorteo.model';

export interface SorteoState {
  sorteos: Sorteo[];
}

export const initialState: SorteoState = {
  sorteos: [],
};

export const sorteoReducer = createReducer(
  initialState,

  on(SorteoActions.loadSorteosSuccess, (state, { sorteos }) => ({
    ...state,
    sorteos: [...sorteos].sort((a, b) => Number(a.id) - Number(b.id)), // ✅ conversión a número
  })),

  on(SorteoActions.addSorteo, (state, { sorteo }) => ({
    ...state,
    sorteos: state.sorteos.some(s => s.id === sorteo.id)
      ? state.sorteos // si ya existe, no lo agrega
      : [...state.sorteos, sorteo].sort((a, b) => Number(a.id) - Number(b.id)), // ✅ conversión
  })),

  on(SorteoActions.updateSorteo, (state, { sorteo }) => ({
    ...state,
    sorteos: state.sorteos.map(s => s.id === sorteo.id ? sorteo : s)
      .sort((a, b) => Number(a.id) - Number(b.id)), // ✅ conversión
  })),

  on(SorteoActions.removeSorteo, (state, { sorteoId }) => ({
    ...state,
sorteos: state.sorteos.filter(s => s.id !== Number(sorteoId))
  })),

    on(SorteoActions.clearSorteos, () => initialState),
  

  on(SorteoActions.loadSorteoSuccess, (state, { sorteo }) => ({
    ...state,
    sorteos: [
      ...state.sorteos.filter(s => s.id !== sorteo.id),
      sorteo
    ].sort((a, b) => Number(a.id) - Number(b.id)), // ✅ conversión
  })),
);
