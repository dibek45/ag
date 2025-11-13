import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmar-cita-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="overlay">
  <div class="modal">
    <h2>Confirmar cita</h2>
    <p><b>Servicio:</b> {{ servicio?.nombre }}</p>
    <p><b>Inicio:</b> {{ horaInicio }}</p>
    <p><b>Fin:</b> {{ horaFin }}</p>
    <p><b>Duración:</b> {{ servicio?.duracionMin }} min</p>

    <div class="botones">
      <button class="btn-si" (click)="confirmar()">Confirmar</button>
      <button class="btn-no" (click)="cancelar()">Cancelar</button>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./confirmar-cita-modal.component.scss']
})
export class ConfirmarCitaModalComponent {
  @Input() servicio: any;
  @Input() horaInicio!: string;
  @Input() horaFin!: string;

 @Output() confirm = new EventEmitter<void>();
@Output() cancel = new EventEmitter<void>();


  confirmar() {
    this.confirm.emit();
  }

  cancelar() {
    this.cancel.emit();
  }
}
