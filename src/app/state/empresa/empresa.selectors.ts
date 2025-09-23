import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmpresaState } from './empresa.model';

export const selectEmpresaState =
  createFeatureSelector<EmpresaState>('empresas');

export const selectAllEmpresas = createSelector(
  selectEmpresaState,
  (state) => state.empresas
);

export const selectEmpresaById = (empresaId: number) =>
  createSelector(selectAllEmpresas, (empresas) =>
    empresas.find((e) => e.id === empresaId)
  );
