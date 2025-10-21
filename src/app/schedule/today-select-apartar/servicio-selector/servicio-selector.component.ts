import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../state/evento/evento.model';

@Component({
  selector: 'app-servicio-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="servicios" *ngIf="servicios?.length">
      <div class="servicio-wrapper" *ngFor="let s of servicios">
        <button
          class="servicio-btn"
          [class.active]="servicioSeleccionado?.id === s.id"
          (click)="seleccionar(s)">
          {{ s.nombre }} ({{ s.duracionMin }} min)
        </button>

        <!-- Ícono tipo badge -->
        <span
          *ngIf="servicioSeleccionado?.id === s.id"
          class="badge-x"
          (click)="deseleccionar($event)">
          ✕
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./servicio-selector.component.scss']
})
export class ServicioSelectorComponent {
  @Input() servicios: Servicio[] = [];
  @Input() servicioSeleccionado?: Servicio;
  @Output() servicioChange = new EventEmitter<Servicio | null>();

  seleccionar(servicio: Servicio) {
    if (this.servicioSeleccionado?.id === servicio.id) return;
    this.servicioSeleccionado = servicio;
    this.servicioChange.emit(servicio);
  }

  deseleccionar(event: MouseEvent) {
    event.stopPropagation();
    this.servicioSeleccionado = undefined;
    this.servicioChange.emit(null);
  }
}
