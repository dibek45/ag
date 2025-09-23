import { Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllEventos } from '../../state/evento/evento.selectors';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.scss']
})
export class WhatsappButtonComponent {
  private store = inject(Store);

  telefono = signal<string>('');

  constructor() {
    /*
    this.store.select(selectAllEventos).pipe(
      map(eventos => eventos.length ? eventos[0] : undefined) // 👈 tomamos el primero
    ).subscribe(evento => {
      if (evento?.admin?.telefono) {
        // ⚡ aseguramos que solo queden dígitos
        const cleanPhone = evento.admin.telefono.replace(/\D/g, '');
        this.telefono.set(cleanPhone);
      }
    });
    */
  }
}
