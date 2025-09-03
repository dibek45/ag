import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-agenda.component.html',
  styleUrls: ['./login-agenda.component.scss']
})
export class LoginAgendaComponent {
  username = '';
  password = '';

  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  submitLogin() {
    // Aquí puedes validar con tu AuthService si quieres
    if (this.username.trim() && this.password.trim()) {
      this.loginSuccess.emit();
    } else {
      alert('⚠️ Ingresa usuario y contraseña');
    }
  }

  close() {
    this.closeModal.emit();
  }
}
