import { createAction, props } from '@ngrx/store';

export const loginWithGoogle = createAction(
  '[Auth] Login With Google',
  props<{ email: string; name: string; img?: string; token?: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ role: 'admin' | 'user'; adminId: number; token?: string }>()
);

export const logout = createAction('[Auth] Logout');
