import { createAction, props } from '@ngrx/store';
import { Sorteo } from './sorteo.model';

export const loadSorteos = createAction(
  '[Sorteo] Load Sorteos'
);

export const loadSorteosSuccess = createAction(
  '[Sorteo] Load Sorteos Success',
  props<{ sorteos: Sorteo[] }>()
);

export const addSorteo = createAction(
  '[Sorteo] Add Sorteo',
  props<{ sorteo: Sorteo }>()
);

export const removeSorteo = createAction(
  '[Sorteo] Remove Sorteo',
  props<{ sorteoId: string }>()
);

export const updateSorteo = createAction(
  '[Sorteo] Update Sorteo',
  props<{ sorteo: Sorteo }>()
);

export const updateSorteoEnStore = createAction(
  '[Sorteo] Actualizado desde socket',
  props<{ sorteo: Sorteo }>()
);
export const loadSorteoSuccess = createAction(
  '[Sorteo] Load Sorteo Success',
  props<{ sorteo: Sorteo }>()
);



export const clearSorteos = createAction('[Sorteo] Clear All');