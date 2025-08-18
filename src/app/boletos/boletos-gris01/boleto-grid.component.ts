import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { BoletoItemComponent01 } from './boleto-item-new-01/boleto-item.component';
import { Boleto } from '../../state/boleto/boleto.model';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { selectAllBoletos, selectBoletosSeleccionadosPorSorteo, selectSelectedBoletos } from '../../state/boleto/boleto.selectors';
import * as BoletoActions from '../../state/boleto/boleto.actions';
import { ActivatedRoute } from '@angular/router';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import { Sorteo } from '../../state/sorteo/sorteo.model';

@Component({
  selector: 'app-boleto-grid',
  standalone: true,
  imports: [CommonModule, BoletoItemComponent01],
  templateUrl: './boleto-grid.component.html',
  styleUrl: './boleto-grid.component.scss'
})
export class BoletoGrid01Component {
sorteo!: Sorteo; // 👈 esto va arriba en la clase

  @Output() seleccionCambio = new EventEmitter<Boleto[]>();
  anchoNumero: number=0;
  boletos: Boleto[] | undefined;

  constructor(private store: Store, private route: ActivatedRoute) {}
boletos$!: Observable<Boleto[]>;
ngOnInit() {
this.cargaDesdeStore()

}

cargaDesdeStore() {
  const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
  if (!Number.isFinite(sorteoId)) {
    console.error('❌ Invalid sorteoId in URL:', sorteoId);
    return;
  }

  // 1) tie the observable to THIS sorteo
  this.boletos$ = this.store.select(selectAllBoletos(sorteoId));   // ✅ CALL factory

  // 2) gate the API load by per-sorteo contents
  this.store.select(selectAllBoletos(sorteoId))                     // ✅ CALL factory
    .pipe(take(1))
    .subscribe(boletos => {
      this.store.select(selectBoletosSeleccionadosPorSorteo(sorteoId)) // ✅ CALL factory
        .pipe(take(1))
        .subscribe(seleccionados => {
          if ((!boletos?.length) && (!seleccionados?.length)) {
            this.store.dispatch(BoletoActions.loadBoletos({ sorteoId })); // ✅ number
          } else {
            console.log('✅ Boletos already in store.');
          }
        });
    });

  // 3) (optional) keep a local array
  this.store.select(selectAllBoletos(sorteoId))                     // ✅ CALL factory
    .subscribe(data => {
      this.boletos = data; // data is Boleto[]
    });

  // 4) sorteo info (unchanged)
  this.store.select(selectSorteos).subscribe(sorteos => {
    const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
    if (encontrado) this.sorteo = encontrado;
  });
}


toggleSeleccion(boleto: Boleto) {
  const nuevoEstado = boleto.estado === 'disponible' ? 'ocupado' : 'disponible';

  const boletoActualizado: Boleto = { ...boleto, estado: nuevoEstado };
  const sorteoId = Number(boleto.sorteo?.id); // ensure number

  console.log('📤 toggleSeleccion →', { sorteoId, boletoActualizado });

  this.store.dispatch(
    BoletoActions.addBoletoSeleccionado({
      sorteoId,
      boleto: boletoActualizado,
    })
  );
}


}