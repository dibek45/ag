import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  // 🔹 Login con Google
  loginWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginWithGoogle),
      switchMap(({ email, name, img, token }) =>
        this.authService.loginWithGoogle(email, name).then(
          (user) =>
            AuthActions.loginSuccess({
              role: user.isAdmin ? 'admin' : 'user',
              adminId: user.id,
              token,
            }),
          (error) => {
            console.error('❌ Error en loginWithGoogle$', error);
            return { type: '[Auth] Login Error' };
          }
        )
      )
    )
  );

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
        if (!saved) return { type: '[Auth] No Session Found' };
        const data = JSON.parse(saved);
        return AuthActions.loginSuccess({
          role: data.role,
          adminId: data.adminId,
          token: data.token,
        });
      })
    )
  );
}
