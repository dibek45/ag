import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  // ✅ Inyectamos Actions de forma segura (sin usar constructor)
  private readonly actions$ = inject(Actions);

  // ✅ Guardar sesión en localStorage
  persistLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ role, adminId, token }) => {
          const data = { role, adminId, token, isLoggedIn: true };
          localStorage.setItem('auth', JSON.stringify(data));
          console.log('💾 Sesión guardada en localStorage:', data);
        })
      ),
    { dispatch: false }
  );

  // ✅ Borrar sesión
  clearLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('auth');
          console.log('🧹 Sesión eliminada de localStorage');
        })
      ),
    { dispatch: false }
  );

  // ✅ Restaurar sesión al iniciar app
  restoreLogin$ = createEffect(() =>
    of(localStorage.getItem('auth')).pipe(
      map((saved) => {
        if (!saved) {
          console.log('⚠️ No se encontró sesión previa');
          return { type: '[Auth] No Session Found' };
        }

        const data = JSON.parse(saved);
        console.log('🔁 Sesión restaurada desde localStorage:', data);
        return AuthActions.loginSuccess({
          role: data.role,
          adminId: data.adminId,
          token: data.token
        });
      })
    )
  );
}
