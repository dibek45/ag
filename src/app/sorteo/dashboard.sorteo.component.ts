import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Sorteo } from '../state/sorteo/sorteo.model';
import { Boleto } from '../state/boleto/boleto.model';
import { selectAllBoletos, selectSelectedBoletos } from '../state/boleto/boleto.selectors';
import { selectSorteos } from '../state/sorteo/sorteo.selectors';
import * as BoletoActions from '../state/boleto/boleto.actions';
import * as SorteoActions from '../state/sorteo/sorteo.actions';

@Component({
  selector: 'app-sorteo',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sorteo.component.html',
  styleUrls: ['./sorteo.component.scss'],
})
export class SorteoComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  sorteo?: Sorteo;
  logoUrl = '';
  boletos$!: Observable<Boleto[]>;

  ngOnInit(): void {
    this.cargaDesdeStore();
  }

  private loadBoletosFromLocal(sorteoId: number) {
    try {
      const raw = localStorage.getItem(`boletos-${sorteoId}`);
      const boletos: Boleto[] = raw ? JSON.parse(raw) : [];
      this.store.dispatch(BoletoActions.loadBoletosSuccess({ sorteoId, boletos }));
      console.log('📥 Boletos desde localStorage:', boletos.length);
    } catch (e) {
      console.error('❌ No pude leer boletos locales:', e);
      this.store.dispatch(BoletoActions.loadBoletosSuccess({ sorteoId, boletos: [] }));
    }
  }

  private loadSorteosFromLocalIfNeeded(sorteoId: number) {
    try {
      const raw = localStorage.getItem('sorteos');
      const sorteos: Sorteo[] = raw ? JSON.parse(raw) : [];
      if (sorteos?.length) {
        this.store.dispatch(SorteoActions.loadSorteosSuccess({ sorteos }));
        const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
        if (encontrado) this.sorteo = encontrado;
      }
    } catch (e) {
      console.error('❌ No pude leer sorteos locales:', e);
    }
  }

  cargaDesdeStore() {
    const sorteoId = Number(this.route.snapshot.paramMap.get('numeroSorteo'));
    console.log('🧪 Param sorteoId recibido:', sorteoId);

    if (!sorteoId || isNaN(sorteoId)) {
      console.error('❌ sorteoId inválido en la URL:', sorteoId);
      return;
    }

    // 🟩 Carga boletos (la decisión API/local la hará el effect)
    this.store
      .select(selectAllBoletos(sorteoId))
      .pipe(take(1))
      .subscribe((boletos) => {
        this.store
          .select(selectSelectedBoletos(sorteoId.toString()))
          .pipe(take(1))
          .subscribe((seleccionados) => {
            const faltanBoletos =
              (!boletos || boletos.length === 0) &&
              (!seleccionados || seleccionados.length === 0);

            if (faltanBoletos) {
              console.log('📤 Despachando loadBoletos para', sorteoId);
              this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
            } else {
              console.log('✅ Ya hay boletos en el store.');
            }
          });
      });

    // 🟦 Buscar sorteo en el store
    this.store.select(selectSorteos).pipe(take(1)).subscribe((sorteos) => {
      const encontrado = sorteos.find((s) => Number(s.id) === sorteoId);
      if (encontrado) {
        this.sorteo = encontrado;
        console.log('🎯 Sorteo detectado en store:', this.sorteo);
      } else {
        console.warn('⚠️ Sorteo no encontrado en store. Cargando desde API...');
        this.store.dispatch(SorteoActions.loadSorteos());
      }
    });

    // Logo
    this.logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/${sorteoId}.png`;

    // Suscripción para la vista
    this.boletos$ = this.store.select(selectAllBoletos(sorteoId));
  }

  logoFallback() {
    this.logoUrl = 'assets/default-logo.png';
  }
}
