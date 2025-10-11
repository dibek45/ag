import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private store: Store) {}

  async loginWithGoogle(email: string, token?: string) {
    try {
      const query = `
        mutation LoginGoogle($email: String!) {
          loginGoogle(email: $email) {
            id
            name
            username
            isAdmin
          }
        }
      `;

      const variables = { email };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { query, variables };

      // 🧾 LOGS DETALLADOS
      console.log('----------------------------------------------------');
      console.log('📤 Body enviado a GraphQL:\n', JSON.stringify(body, null, 2));
      console.log('🌐 Endpoint ->', this.apiUrl);

      // 🚀 Petición GraphQL
      const res: any = await firstValueFrom(
        this.http.post(this.apiUrl, body, { headers })
      );

      // 📬 Respuesta exitosa
      console.log('✅ Respuesta recibida:', res);

      const user = res?.data?.loginGoogle;
      if (!user) {
        console.warn('⚠️ No existe una cuenta con ese correo:', email);
        return null;
      }

      // 🧠 Guardar sesión en Redux
      this.store.dispatch(
        AuthActions.loginSuccess({
          role: user.isAdmin ? 'admin' : 'user',
          adminId: user.id,
          token: token ?? undefined,
        })
      );

      console.log('🎉 Login exitoso con Google:', user);
      console.log('----------------------------------------------------');
      return user;

    } catch (error: any) {
      console.error('❌ Error en loginWithGoogle:');

      if (error instanceof HttpErrorResponse) {
        console.error('🛑 STATUS:', error.status, error.statusText);
        console.error('🧱 URL:', error.url);
        console.error('📦 Error body:', error.error);
        console.error('💬 Mensaje GraphQL:', error.error?.errors?.[0]?.message);
      } else {
        console.error('⚠️ Error desconocido:', error);
      }

      // 🌍 Mostrar origen actual (útil para depurar Google OAuth)
      console.log('🌍 window.location.origin ->', window.location.origin);

      console.log('----------------------------------------------------');
      throw error;
    }
  }
}
