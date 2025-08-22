import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-cambiar-estado-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-estado-modal.component.html',
  styleUrls: ['./cambiar-estado-modal.component.scss']
})
export class CambiarEstadoModalComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }
  /*
ngOnChanges(changes: SimpleChanges): void {
  if (changes['reasignacion']) {
    this.confirmado = false;
    console.log('📢 Input `reasignacion` cambiado:', this.reasignacion);
  }
}
confirmado: boolean = false;

@Output() estadoSeleccionado = new EventEmitter<'disponible' | 'ocupado' | 'pagado' | null>();
@Input() reasignacion: boolean = false;
@Output() reasignar = new EventEmitter<{ boleto: Boleto; nombre: string; telefono: string }>();
nuevoNombre: string = '';
nuevoTelefono: string = '';

  estados = ['disponible', 'ocupado', 'pagado'];

 cambiarEstado(estado: 'disponible' | 'ocupado' | 'pagado') {
  this.estadoSeleccionado.emit(estado);
}


  cerrar() {
    this.estadoSeleccionado.emit(null);
  }

emitirReasignacion() {
  if (!this.nuevoNombre.trim()) {
    alert('Debes ingresar un nombre válido');
    return;
  }

  if (!/^\d{10}$/.test(this.nuevoTelefono)) {
    alert('El teléfono debe tener exactamente 10 dígitos');
    return;
  }

  this.reasignar.emit({
    boleto: this.boleto,
    nombre: this.nuevoNombre.trim(),
    telefono: this.nuevoTelefono
  });
}

emitirReasignacionConEstado(estado: 'ocupado' | 'pagado') {
  if (!this.nuevoNombre.trim()) {
    alert('Debes ingresar un nombre válido');
    return;
  }

  if (!/^\d{10}$/.test(this.nuevoTelefono)) {
    alert('El teléfono debe tener exactamente 10 dígitos');
    return;
  }

  this.reasignar.emit({
    boleto: {
      ...this.boleto,
      estado,
      comprador: {
        ...this.boleto.comprador,
        nombre: this.nuevoNombre.trim(),
        telefono: this.nuevoTelefono
      }
    },
    nombre: this.nuevoNombre.trim(),
    telefono: this.nuevoTelefono
  });
}
*/

}
