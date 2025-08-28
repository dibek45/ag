import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import * as SorteoActions from '../../state/sorteo/sorteo.actions';

@Component({
  selector: 'app-bonos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bonos.component.html',
  styleUrl: './bonos.component.scss',
})
export class BonosComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  sorteo?: Sorteo;
  boletos: { cantidad: number; precio: number }[] = [];

  ngOnInit(): void {
  this.cargarDesdeStore();
  }

cargarDesdeStore() {
  const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
  console.log('🧪 Param sorteoId recibido: ' + sorteoId);

  if (!sorteoId || isNaN(sorteoId)) {
    console.error('❌ sorteoId inválido en la URL:', sorteoId);
    return;
  }

  // ✅ Cargar sorteos si el array está vacío
  this.store.select(selectSorteos).pipe(take(1)).subscribe((sorteos) => {
    console.log('📦 Sorteos en el store:', sorteos);
  

    // Espera un poco a que se carguen los sorteos
    this.store.select(selectSorteos).subscribe((sorteosActualizados) => {
      const encontrado = sorteosActualizados.find((s) => Number(s.id) === sorteoId);
      if (encontrado) {
        this.sorteo = encontrado;
        const precioUnitario = encontrado.costoBoleto || 30;
        console.log('🎯 Sorteo encontrado:', this.sorteo);

        this.boletos = Array.from({ length: 10 }, (_, i) => ({
          cantidad: i + 1,
          precio: (i + 1) * precioUnitario,
        }));
      } else {
        console.warn('⚠️ No se encontró sorteo con ID:', sorteoId);
      }
    });
  });
}

}
