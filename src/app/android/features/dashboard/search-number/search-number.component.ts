import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Boleto } from '../../../../state/boleto/boleto.model';

type ResultadoBusqueda =
  | {
      comprador: Boleto['comprador'];
      cantidad: number;
      tipo: 'boleto';
      numero: number;
      listaBoletos?: number[];
      mostrandoBoletos?: boolean;
      boletos?: Boleto[];
    }
  | {
      comprador: Boleto['comprador'];
      cantidad: number;
      tipo: 'telefono';
      listaBoletos?: number[];
      mostrandoBoletos?: boolean;
      boletos?: Boleto[];
    };

@Component({
  selector: 'app-search-number',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-number.component.html',
  styleUrls: ['./search-number.component.scss']
})
export class SearchNumberComponent {
  @Input() boletos: Boleto[] = [];
@Output() resultadosChange = new EventEmitter<number>();


@Input() set resetTelefono(valor: boolean) {
  if (valor !== undefined) {

    this.limpiarTelefono();
  }
}




  @Output() telefonoChange = new EventEmitter<string>();
  @Output() compradorSeleccionado = new EventEmitter<{ telefono: string; compradorId: number }>();

  telefono: string = '';
  resultados: ResultadoBusqueda[] = [];

  buscarPorTelefono() {
  const tel = this.telefono.trim().toLowerCase();
  this.resultados = [];

  // 🔢 Buscar por número de boleto exacto
  if (/^\d+$/.test(tel)) {
    const encontrado = this.boletos.find(b => String(b.numero) === tel);
    if (encontrado && encontrado.comprador) {
      this.resultados = [
        {
          comprador: encontrado.comprador,
          cantidad: 1,
          tipo: 'boleto',
          numero: Number(encontrado.numero)
        }
      ];
      this.telefonoChange.emit(tel);
      return;
    }
  }

  // 📞 Buscar por teléfono o por nombre
  const map = new Map<number, ResultadoBusqueda>();

  for (const b of this.boletos) {
    const comprador = b.comprador;
    const telefonoMatch = comprador?.telefono?.toLowerCase().includes(tel);
    const nombreMatch = comprador?.nombre?.toLowerCase().includes(tel);

    if ((telefonoMatch || nombreMatch) && comprador?.id && b.estado !== 'disponible') {
      const current = map.get(comprador.id);
      if (current) {
        current.cantidad++;
        (current.boletos ||= []).push(b); // 🔹 si no existe array, lo crea
      } else {
        map.set(comprador.id, {
          comprador,
          cantidad: 1,
          tipo: 'telefono',
          boletos: [b] // 🔹 guardamos todos los boletos desde el inicio
        });
      }
    }
  }

  this.resultados = Array.from(map.values());
  this.telefonoChange.emit(tel);
    this.resultadosChange.emit(this.resultados.length); // 👈 emite cantidad

}

  limpiarTelefono() {
    this.telefono = '';
    this.resultados = [];
    this.telefonoChange.emit('');
  }

  seleccionarPorComprador(comprador: Boleto['comprador']) {
    const telefonoCompleto = comprador?.telefono?.trim() || '';
    if (comprador?.id) {
      this.compradorSeleccionado.emit({
        telefono: telefonoCompleto,
        compradorId: comprador.id
      });
    }
    this.telefono = telefonoCompleto;
    this.resultados = [];
  }

mostrarBoletos(resultado: ResultadoBusqueda, event: MouseEvent) {
  event.stopPropagation();
  if (!resultado.listaBoletos) {
    resultado.listaBoletos = resultado.boletos?.map(b => Number(b.numero)) || [];
  }
  resultado.mostrandoBoletos = !resultado.mostrandoBoletos;
}

}
