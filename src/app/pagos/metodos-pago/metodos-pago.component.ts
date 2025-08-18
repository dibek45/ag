import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import { selectAllBoletos, selectSelectedBoletos } from '../../state/boleto/boleto.selectors';
import * as BoletoActions from '../../state/boleto/boleto.actions';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from '../../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss',
  imports: [CommonModule,BottomNavComponent],
})
export class MetodosPagoComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/`;

  sorteo?: Sorteo;
  boletos$!: Observable<any>;

  ngOnInit(): void {
    this.cargarDatosDesdeStore();
  }

  cargarDatosDesdeStore() {
    this.boletos$ = this.store.select(selectAllBoletos);

    const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
    console.log('🧪 Param sorteoId recibido:' + sorteoId);

    if (!sorteoId || isNaN(sorteoId)) {
      console.error('❌ sorteoId inválido en la URL:', sorteoId);
      return;
    }

    this.store.select(selectAllBoletos).pipe(take(1)).subscribe((boletos) => {
      this.store.select(selectSelectedBoletos).pipe(take(1)).subscribe((seleccionados) => {
        if ((!boletos || boletos.length === 0) && (!seleccionados || seleccionados.length === 0)) {
          console.log('📡 Cargando boletos desde API para sorteoId:', sorteoId);
          this.store.dispatch(BoletoActions.loadBoletos({ sorteoId: sorteoId }));
        } else {
          console.log('✅ Ya hay boletos en el store.');
        }
      });
    });

    this.store.select(selectSorteos).subscribe((sorteos) => {
      const encontrado = sorteos.find((s) => Number(s.id) === Number(sorteoId));
      if (encontrado) {
this.logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/${sorteoId}.png`;

        this.sorteo = encontrado;
        console.log('🎯 Sorteo detectado en store (método de pago):', this.sorteo);
      }
    });
  }

  contactarWhatsApp(): void {
    const numero = this.sorteo?.numeroWhatsApp ?? '5216146087479';
    window.open(`https://wa.me/${numero}`, '_blank');
  }
}
