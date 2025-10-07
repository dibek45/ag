import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  isLoggedIn: boolean;
  role: 'admin' | 'user' | null;
  adminId: number | null;
  token?: string | null;
}

export const initialState: AuthState = {
  isLoggedIn: false,
  role: null,
  adminId: null,
  token: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { role, adminId, token }) => ({
    ...state,
    role,
    adminId,
    token: token || null,
    isLoggedIn: true
  })),
  on(AuthActions.logout, () => initialState)
);
