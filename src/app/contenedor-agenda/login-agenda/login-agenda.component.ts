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

  loading = false;

  // 🔹 Modos del login
  mode: 'google' | 'phone' | 'verify' = 'google';

  // 🔹 Teléfono
  phone = '';
  phoneCode = '';

  @Output() loginSuccess = new EventEmitter<{ 
    role: 'admin' | 'user'; 
    provider?: 'google' | 'phone'; 
    token?: string; 
    user?: any; 
  }>();

  @Output() closeModal = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  // ⭐ GOOGLE LOGIN
  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id: '123194794319-dgvffo1qkkf07csrqjim2hjfet5jqkiv.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response),
    });

    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
      theme: 'outline',
      size: 'large',
      width: 320,
    });
  }

  async handleGoogleLogin(response: any) {
    this.loading = true;

    try {
      const token = response.credential;
      const userData = this.decodeJwt(token);

      const user = await this.authService.loginWithGoogle(
        userData.email,
        token
      );

      this.loginSuccess.emit({
        role: user.isAdmin ? 'admin' : 'user',
        provider: 'google',
        token,
        user
      });

    } catch (error) {
      alert('Error con Google');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

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

  // ⭐ TELÉFONO → ENVIAR CÓDIGO
async sendPhoneCode() {
  if (!this.phone.trim()) {
    alert('Ingresa tu número');
    return;
  }

  try {
    // 🔥 Ahora el backend manda el código por tu bot
    await this.authService.sendPhoneCode(this.phone);

    alert("Te enviamos un código por WhatsApp 📲");

    this.mode = 'verify';

  } catch (err) {
    alert('Error enviando código');
    console.error(err);
  }
}


  // ⭐ TELÉFONO → VERIFICAR CÓDIGO
  async verifyPhoneCode() {
    if (!this.phoneCode.trim()) {
      alert('Ingresa el código');
      return;
    }

    try {
      const res: any = await this.authService.verifyPhoneCode(
        this.phone,
        this.phoneCode
      );

      if (!res.success) {
        alert(res.message);
        return;
      }

      this.loginSuccess.emit({
        role: res.user.isAdmin ? 'admin' : 'user',
        provider: 'phone',
        user: res.user
      });

      this.close();

    } catch (err) {
      alert('Error verificando código');
      console.error(err);
    }
  }

  close() {
    this.closeModal.emit();
  }
}
