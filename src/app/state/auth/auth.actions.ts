import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{
    role: 'admin' | 'user';
    adminId: number;
    token?: string;
  }>()
);
export const logout = createAction('[Auth] Logout');
