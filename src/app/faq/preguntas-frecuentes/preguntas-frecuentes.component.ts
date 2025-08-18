import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import { Boleto } from '../../state/boleto/boleto.model';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import { selectAllBoletos, selectBoletosSeleccionadosPorSorteo, selectSelectedBoletos } from '../../state/boleto/boleto.selectors';
import * as SorteoActions from '../../state/sorteo/sorteo.actions';
import * as BoletoActions from '../../state/boleto/boleto.actions';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PrizeInfoComponent } from '../../components/prize-info/prize-info.component';
import { DibekInformationComponent } from '../../dibek-information/dibek-information.component';
import { Observable } from 'rxjs';
import { BottomNavComponent } from '../../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-preguntas-frecuentes',
  standalone: true,
  templateUrl: './preguntas-frecuentes.component.html',
  styleUrl: './preguntas-frecuentes.component.scss',
  imports: [ DibekInformationComponent, CommonModule,BottomNavComponent],
})
export class PreguntasFrecuentesComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/`;

  sorteo?: Sorteo;
  boletos$!: Observable<Boleto[]>;

  ngOnInit(): void {
    this.cargaDesdeStore();
  }

cargaDesdeStore() {
  const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
  console.log('🧪 Param sorteoId recibido:', sorteoId);

  if (!Number.isFinite(sorteoId)) {
    console.error('❌ sorteoId inválido en la URL:', sorteoId);
    return;
  }

  // ✅ call the selector FACTORY with the id
  this.boletos$ = this.store.select(selectAllBoletos(sorteoId));

  // gate load by store contents (per sorteo)
  this.store.select(selectAllBoletos(sorteoId)).pipe(take(1)).subscribe((boletos) => {
    this.store.select(selectBoletosSeleccionadosPorSorteo(sorteoId))
      .pipe(take(1))
      .subscribe((seleccionados) => {
        if ((!boletos || boletos.length === 0) && (!seleccionados || seleccionados.length === 0)) {
          console.log('📡 Cargando boletos desde API para sorteoId:', sorteoId);
          this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
        } else {
          console.log('✅ Ya hay boletos en el store.');
        }
      });
  });

  this.store.select(selectSorteos).subscribe((sorteos) => {
    const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
    if (encontrado) {
      this.sorteo = encontrado;
      this.logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/${sorteoId}.png`;
      console.log('📘 Sorteo cargado en PreguntasFrecuentesComponent:', this.sorteo);
    }
  });
}


  contactarWhatsApp() {
    const numero = this.sorteo?.numeroWhatsApp;
    window.open(`https://wa.me/${numero}`, '_blank');
  }
}
