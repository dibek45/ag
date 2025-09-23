import { createAction, props } from '@ngrx/store';
import { Empresa } from './empresa.model';
import { Evento } from '../evento/evento.model';

export const loadEmpresas = createAction('[Empresa] Load Empresas');
export const loadEmpresasSuccess = createAction(
  '[Empresa] Load Empresas Success',
  props<{ empresas: Empresa[] }>()
);
// opcional si luego quieres manejar error
export const loadEmpresasFailure = createAction(
  '[Empresa] Load Empresas Failure',
  props<{ error: any }>()
);

// Para cuando pidas eventos por empresa desde el componente
export const loadEventosByEmpresa = createAction(
  '[Empresa] Load Eventos By Empresa',
  props<{ empresaId: number }>()
);
export const loadEventosByEmpresaSuccess = createAction(
  '[Empresa] Load Eventos By Empresa Success',
  props<{ empresaId: number; eventos: Evento[] }>()
);
// opcional
export const loadEventosByEmpresaFailure = createAction(
  '[Empresa] Load Eventos By Empresa Failure',
  props<{ error: any }>()
);
