import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from './auth.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  // ✅ Login con Google
  loginWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginWithGoogle),
      switchMap(({ email, name, img, token }) => {
        console.log('🔥 Efecto loginWithGoogle activado');

        // 🏢 Recuperar adminId desde localStorage si existe
        const empresaData = localStorage.getItem('empresa');
        let adminId: number | null = null;
        if (empresaData) {
          const empresa = JSON.parse(empresaData);
          adminId = empresa.id ?? null;
        }

        // 🔹 Llamada al backend
        return from(this.authService.loginWithGoogle(email, token)).pipe(
          map((user) => {
            console.log('🧩 Usuario recibido del backend:', user);

            const clienteId = Number(user?.id) || 100;
            console.log('🔍 clienteId final:', clienteId);

            return AuthActions.loginSuccess({
              role: (user.isAdmin ? 'admin' : 'user') as 'admin' | 'user',
              adminId,
              clienteId,
              token,
            });
          }),

          // 💾 Guarda sesión local fusionando datos previos
          tap((action) => {
            const prev = JSON.parse(localStorage.getItem('auth') || '{}');
            const data = {
              role: (action as any).role ?? prev.role,
              adminId: (action as any).adminId ?? prev.adminId,
              clienteId: (action as any).clienteId ?? prev.clienteId,
              token: (action as any).token ?? prev.token,
              isLoggedIn: true,
            };
            localStorage.setItem('auth', JSON.stringify(data));
            console.log('💾 Sesión guardada desde AuthEffects (fusionada):', data);
          }),

          catchError((error) => {
            console.error('❌ Error en loginWithGoogle$', error);
            return of({ type: '[Auth] Login Error' });
          })
        );
      })
    )
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

  // ✅ Restaurar sesión
  restoreLogin$ = createEffect(() =>
    of(localStorage.getItem('auth')).pipe(
      map((saved) => {
        if (!saved) return { type: '[Auth] No Session Found' };
        const data = JSON.parse(saved);
        return AuthActions.loginSuccess({
          role: data.role,
          adminId: data.adminId,
          clienteId: data.clienteId,
          token: data.token,
        });
      })
    )
  );
}
