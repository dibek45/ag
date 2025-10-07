import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth.reducer';
// importa los demás reducers también

export interface AppState {
  auth: AuthState;
  // otros slices...
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  // otros reducers...
};
