import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../state/auth/auth.service';

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
  loading = false;

  // ✅ Outputs para comunicar al padre
  @Output() loginSuccess = new EventEmitter<{ 
    role: 'admin' | 'user'; 
    provider?: 'google' | 'manual'; 
    token?: string; 
    user?: any; 
  }>();

  @Output() closeModal = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    // ✅ Inicializa Google Sign-In
    google.accounts.id.initialize({
      client_id: '123194794319-dgvffo1qkkf07csrqjim2hjfet5jqkiv.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response),
    });

    // ✅ Renderiza botón
    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
      theme: 'outline',
      size: 'large',
      width: 320,
    });
  }

  // ✅ Login manual simple
  submitLogin() {
    if (!this.username.trim() || !this.password.trim()) {
      alert('⚠️ Ingresa usuario y contraseña');
      return;
    }

    const role: 'admin' | 'user' =
      this.username.toLowerCase().includes('admin') ? 'admin' : 'user';

    console.log(`✅ Login manual como ${role.toUpperCase()}`);

    // 🔹 Simula login manual
    this.loginSuccess.emit({
      role,
      provider: 'manual',
      user: { name: this.username }
    });
  }

  // ✅ Login con Google
  async handleGoogleLogin(response: any) {
    this.loading = true;
    try {
      const token = response.credential;
      const userData = this.decodeJwt(token);

      console.log('✅ Usuario de Google:', userData);

      const user = await this.authService.loginWithGoogle(
        userData.email,
        userData.name,
 
      );

      // 🔹 Emitir evento al padre con los datos
      this.loginSuccess.emit({
        role: user.isAdmin ? 'admin' : 'user',
        provider: 'google',
        token,
        user
      });

      console.log('🎉 Sesión iniciada correctamente');
    } catch (error) {
      console.error('❌ Error al iniciar sesión con Google:', error);
      alert('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      this.loading = false;
    }
  }

  // 🔹 Decodifica el JWT de Google
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

  // ✅ Cierra el modal
  close() {
    this.closeModal.emit();
  }
}
