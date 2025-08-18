import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoletoState } from './boleto.reducer';
import { Boleto } from './boleto.model';

export const selectBoletoState = createFeatureSelector<BoletoState>('boleto');

export const selectBoletos = createSelector(
  selectBoletoState,
  (state) => state.boletos
);

export const selectAllBoletos = (sorteoId: number) =>
  createSelector(
    selectBoletoState,
    (state: BoletoState) => state.boletos[sorteoId] || []
  );


export const selectSelectedBoletos = (sorteoId: string) =>
  createSelector(
    selectBoletoState,
    (state: BoletoState) => state.boletosSeleccionados[sorteoId] || []
  );



/** 1️⃣ Selector to get the full map of selected tickets */
export const selectBoletosSeleccionadosMapa = createSelector(
  selectBoletoState,
  state => state.boletosSeleccionados
);

/** 2️⃣ Selector factory to get only for one sorteoId */
export const selectBoletosSeleccionados = (sorteoId: number) =>
  createSelector(
    selectBoletosSeleccionadosMapa,
    mapa => mapa[sorteoId] ?? []
  );

/** 3️⃣ Same pattern for all boletos */
export const selectBoletosMapa = createSelector(
  selectBoletoState,
  s => s.boletos
);
// (optional) parallel for all boletos



export const selectBoletosPorSorteo = (sorteoId: number) =>
  createSelector(
    selectBoletos,
    (boletos): Boleto[] => Array.isArray(boletos[sorteoId]) ? boletos[sorteoId] : []
  );


// 🔍 Selector para obtener boletos seleccionados por sorteoId

export const selectBoletosSeleccionadosPorSorteo = (sorteoId: number) =>
  createSelector(selectBoletosSeleccionadosMapa, mapa => mapa[sorteoId] ?? []);
