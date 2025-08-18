import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Boleto } from '../../../state/boleto/boleto.model';

@Component({
  selector: 'app-boleto-item-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleto-item.informationcomponent.html',
  styleUrls: ['./boleto-item.informationcomponent.scss'],



})
export class BoletoItemComponent0InformationCComponent {

  @Input() numero!: string;
  @Input() estado!: string;
  @Output() toggle = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<string>(); // emite el número del boleto cuando se cierra
  @Input() boletoEncontrado!: Boleto | null;
@Input() boleto: Boleto | null = null;



onToggle() {
  if (this.estado === 'ocupado') {
    alert('⚠️ Este boleto ya está apartado');
    return;
  }

  if (this.estado === 'pagado') {
    alert('💰 Este boleto ya fue pagado');
    return;
  }

  this.toggle.emit(); // solo emite si está disponible
}

onCerrarClick(event: MouseEvent) {
  event.stopPropagation(); // evita que dispare el onToggle
  this.cerrar.emit(this.numero);
}

}
