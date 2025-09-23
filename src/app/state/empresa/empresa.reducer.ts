import { createReducer, on } from '@ngrx/store';
import * as EmpresaActions from './empresa.actions';
import { EmpresaState, Empresa } from './empresa.model';

export const initialState: EmpresaState = {
  empresas: [],
  loading: false,
  error: null,
};

export const empresaReducer = createReducer(
  initialState,

  // Cargar empresas (dummy)
  on(EmpresaActions.loadEmpresas, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(EmpresaActions.loadEmpresasSuccess, (state, { empresas }) => ({
    ...state,
    empresas,
    loading: false,
  })),
  on(EmpresaActions.loadEmpresasFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cargar eventos por empresa (dummy o real)
  on(EmpresaActions.loadEventosByEmpresa, (state) => ({
    ...state,
    loading: true,
  })),
  on(EmpresaActions.loadEventosByEmpresaSuccess, (state, { empresaId, eventos }) => {
    const idx = state.empresas.findIndex(e => e.id === empresaId);

    // si la empresa ya existe → actualizar eventos
    if (idx >= 0) {
      const empresas = state.empresas.map((e, i) =>
        i === idx ? { ...e, eventos } : e
      );
      return { ...state, empresas, loading: false };
    }

    // si no existe → crearla con nombre placeholder
    const nuevaEmpresa: Empresa = {
      id: empresaId,
      nombre: `Empresa ${empresaId}`,
      eventos,
    };
    return {
      ...state,
      empresas: [...state.empresas, nuevaEmpresa],
      loading: false,
    };
  }),
  on(EmpresaActions.loadEventosByEmpresaFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
