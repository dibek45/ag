import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boleto-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleto-item.component.html',
  styleUrls: ['./boleto-item.component.scss'],



})
export class BoletoItemComponent01 {
  @Input() pequeno = false;
@Output() seleccionCambio = new EventEmitter<{ numero: string }[]>();
@Input() permitirTodosLosEstados = false;

@Input() mostrarCerrar = false; // 🔥 controla si mostrar la "X"

  @Input() numero!: string;
  @Input() estado!: string;
  @Output() toggle = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<string>(); // emite el número del boleto cuando se cierra


onToggle() {
  if (!this.permitirTodosLosEstados) {
    if (this.estado === 'ocupado') {
      alert('⚠️ Este boleto ya está apartado');
      return;
    }

    if (this.estado === 'pagado') {
      alert('💰 Este boleto ya fue pagado');
      return;
    }
  }

  this.toggle.emit();
}


onCerrarClick(event: MouseEvent) {
  event.stopPropagation(); // evita que dispare el onToggle
  this.cerrar.emit(this.numero);
}

}
