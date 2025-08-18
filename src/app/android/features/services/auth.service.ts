// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  checkTokenExpiration(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000); // tiempo actual en segundos

      if (decoded.exp < now) {
        console.warn('🔒 Token expirado, cerrando sesión...');
        this.logout();
      }
    } catch (e) {
      console.error('❌ Error al decodificar token:', e);
      this.logout();
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('sorteoId');
    this.router.navigate(['/login']);
  }
}
