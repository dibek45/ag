import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsLoggedIn = createSelector(selectAuthState, s => s.isLoggedIn);
export const selectRole = createSelector(selectAuthState, s => s.role);
export const selectAdminId = createSelector(selectAuthState, s => s.adminId);
