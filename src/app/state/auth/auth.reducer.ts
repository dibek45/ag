import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  isLoggedIn: boolean;
  role: 'admin' | 'user' | null;
  adminId: number | null;
  clienteId?: number | null;   // 👈 permitir opcional
  token?: string | null;
}

export const initialState: AuthState = {
  isLoggedIn: false,
  role: null,
  adminId: null,
  clienteId: null,   // 👈 agregar valor inicial
  token: null,
};


export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { role, adminId, clienteId, token }) => ({
    ...state,
    role,
    adminId,
    clienteId,
    token: token || null,
    isLoggedIn: true
  })),
  on(AuthActions.logout, () => initialState)
);
