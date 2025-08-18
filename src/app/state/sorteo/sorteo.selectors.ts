import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SorteoState } from './sorteo.reducer';

// Selecciona el estado de los sorteos desde el feature state
export const selectSorteoState = createFeatureSelector<SorteoState>('sorteo');

// Selecciona todos los sorteos
export const selectSorteos = createSelector(
  selectSorteoState,
  (state) => state.sorteos
);

// Alias más claro para uso común
export const selectAllSorteos = selectSorteos;
export const selectSorteoPorId = (id: string | number) =>
  createSelector(selectSorteos, (sorteos) =>
sorteos.find(s => s.id.toString() === id.toString()));
  

// Opcional: si guardas el ID actual en el store podrías usar esto:
export const selectSorteoActual = createSelector(
  selectSorteoState,
  (state) => state.sorteos[0] // o usar `state.sorteoSeleccionado` si lo tienes
);