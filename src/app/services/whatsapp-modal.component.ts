import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-modal',
  templateUrl: './whatsapp-modal.component.html',
  styleUrls: ['./whatsapp-modal.component.scss'],
  imports:[CommonModule,FormsModule],
  standalone: true,
})
export class WhatsAppModalComponent {
  @Output() confirmado = new EventEmitter<{ nombre: string, telefono: string }>();
  @Output() cancelado = new EventEmitter<void>();

  nombre = '';
  telefono = '';

  get nombreInvalido(): boolean {
    return this.nombre.trim().length < 3;
  }

  get telefonoInvalido(): boolean {
    return !/^\d{10}$/.test(this.telefono);
  }

  confirmar() {
    if (!this.nombreInvalido && !this.telefonoInvalido) {
      this.confirmado.emit({ nombre: this.nombre.trim(), telefono: this.telefono });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }
}
