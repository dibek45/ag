import { Component, inject, signal, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSorteoActual } from '../../state/sorteo/sorteo.selectors'; // ajusta la ruta si es distinta
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.scss'
})
export class WhatsappButtonComponent {
  private store = inject(Store);

  // ✅ Accede directamente al teléfono del sorteo desde el store
  sorteo$ = this.store.selectSignal(selectSorteoActual);

  telefono = computed(() => this.sorteo$()?.numeroWhatsApp ?? '');
}
