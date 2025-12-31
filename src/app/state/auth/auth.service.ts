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





async sendPhoneCode(phone: string) {
  const query = `
    mutation SendPhoneCode($phone: String!) {
      sendPhoneCode(phone: $phone) {
        whatsappLink
      }
    }
  `;
  return firstValueFrom(
    this.http.post(this.apiUrl, { query, variables: { phone } })
  ).then((r: any) => r.data.sendPhoneCode);
}

async verifyPhoneCode(phone: string, code: string) {
  const query = `
    mutation VerifyPhoneCode($phone: String!, $code: String!) {
      verifyPhoneCode(phone: $phone, code: $code) {
        success
        message
        user {
          id
          name
          username
          isAdmin
        }
      }
    }
  `;

  const res: any = await firstValueFrom(
    this.http.post(this.apiUrl, { query, variables: { phone, code } })
  );

  const data = res.data.verifyPhoneCode;
  if (!data.success || !data.user) {
    console.warn("⚠️ Código incorrecto o usuario no válido:", data);
    return data;
  }

  const user = data.user;
  const clienteId = Number(user.id);

  let adminId: number | null = null;
  const empresaData = localStorage.getItem('empresa');
  if (empresaData) {
    const empresa = JSON.parse(empresaData);
    adminId = empresa.id ?? null;
  }

  // 🎯 MISMO FORMATO QUE LOGIN GOOGLE
  const authData = {
    role: user.isAdmin ? 'admin' : 'user',
    adminId,
    clienteId,
    token: null,
    isLoggedIn: true,
  };

  localStorage.setItem('clienteId', String(clienteId));
  localStorage.setItem('auth', JSON.stringify(authData));

  console.log('📲 Login exitoso por teléfono:', authData);

  return data;
}


}
