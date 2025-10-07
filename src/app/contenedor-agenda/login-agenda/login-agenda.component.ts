import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare const google: any;

@Component({
  selector: 'app-login-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-agenda.component.html',
  styleUrls: ['./login-agenda.component.scss']
})
export class LoginAgendaComponent implements AfterViewInit {
  username = '';
  password = '';

  @Output() loginSuccess = new EventEmitter<{ 
    role: 'admin' | 'user'; 
    provider?: 'google' | 'manual'; 
    token?: string; 
    user?: any; 
  }>();

  @Output() closeModal = new EventEmitter<void>();

  ngAfterViewInit() {
    // ✅ Inicializar Google Sign-In
    google.accounts.id.initialize({
      client_id: '123194794319-dgvffo1qkkf07csrqjim2hjfet5jqkiv.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    // ✅ Renderizar botón
    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }

  // ✅ Login manual (por ahora simple)
  submitLogin() {
    if (!this.username.trim() || !this.password.trim()) {
      alert('⚠️ Ingresa usuario y contraseña');
      return;
    }

    const role: 'admin' | 'user' = this.username.toLowerCase().includes('admin') ? 'admin' : 'user';
    console.log(`✅ Login manual como ${role.toUpperCase()}`);

    this.loginSuccess.emit({ role, provider: 'manual' });
  }

  // ✅ Login con Google
  handleGoogleLogin(response: any) {
    const token = response.credential;

    // Decodificamos el JWT
    const userData = this.decodeJwt(token);
    console.log('✅ Usuario de Google:', userData);

    // Emitimos evento con todos los datos
    this.loginSuccess.emit({
      role: 'user',
      provider: 'google',
      token,
      user: {
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      }
    });
  }

  // 🔹 Función para decodificar token JWT
  private decodeJwt(token: string): any {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  close() {
    this.closeModal.emit();
  }
}
