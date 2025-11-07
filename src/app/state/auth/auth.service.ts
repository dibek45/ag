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

    console.log('🌐 Enviando a GraphQL:', body);
    const res: any = await firstValueFrom(this.http.post(this.apiUrl, body, { headers }));

    console.log('🧩 Respuesta GraphQL completa:', res);

    const user = res?.data?.loginGoogle;
    if (!user) {
      console.warn('⚠️ Usuario no encontrado para:', email);
      return null;
    }

    const clienteId = Number(user.id) || 0;
    console.log('🧠 Cliente ID detectado:', clienteId);

    let adminId: number | null = null;
    const empresaData = localStorage.getItem('empresa');
    if (empresaData) {
      const empresa = JSON.parse(empresaData);
      adminId = empresa.id ?? null;
    }

    // 💾 Guarda sesión local forzando clienteId
    const data = {
      role: user.isAdmin ? 'admin' : 'user',
      adminId,
      clienteId,                // 👈 ahora siempre se guarda
      token,
      isLoggedIn: true,
    };
// 💾 Guarda clienteId en su propio storage aislado
localStorage.setItem('clienteId', String(clienteId));
console.log('🗂️ clienteId guardado por separado:', clienteId);

    localStorage.setItem('auth', JSON.stringify(data));
    console.log('💾 Sesión guardada desde AuthService:', data);

    console.log('🎉 Login exitoso con Google:', user);
    return user;

  } catch (error: any) {
    console.error('❌ Error en loginWithGoogle:', error);
    throw error;
  }
}


}
