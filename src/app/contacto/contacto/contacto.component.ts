import { Component, inject, OnInit } from '@angular/core';
import { WhatsappButtonComponent } from '../../components/wp/whatsapp-button.component';
import { DibekInformationComponent } from '../../dibek-information/dibek-information.component';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as SorteoActions from '../../state/sorteo/sorteo.actions';
import * as BoletoActions from '../../state/boleto/boleto.actions';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { selectAllBoletos, selectBoletosSeleccionadosPorSorteo, selectSelectedBoletos } from '../../state/boleto/boleto.selectors';
import { combineLatest, Observable } from 'rxjs';
import { Boleto } from '../../state/boleto/boleto.model';
import { BottomNavComponent } from '../../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss',
  imports: [WhatsappButtonComponent, DibekInformationComponent,CommonModule,BottomNavComponent],
})
export class ContactoComponent implements OnInit {
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
    console.error('❌ Invalid sorteoId in URL:', sorteoId);
    return;
  }

  // ✅ your observable MUST be a selector CALLED with the id
  this.boletos$ = this.store.select(selectAllBoletos(sorteoId));

  // Gate API load by current store contents (per sorteo)
  combineLatest([
    this.store.select(selectAllBoletos(sorteoId)).pipe(take(1)),
    this.store.select(selectBoletosSeleccionadosPorSorteo(sorteoId)).pipe(take(1)),
  ]).subscribe(([boletos, seleccionados]) => {
    if ((!boletos || boletos.length === 0) && (!seleccionados || seleccionados.length === 0)) {
      console.log('📡 Loading boletos from API for sorteoId:', sorteoId);
      this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
    } else {
      console.log('✅ Store already has boletos.');
    }
  });

  // Optional: load sorteo data for UI
  this.store.select(selectSorteos).subscribe((sorteos) => {
    const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
    if (encontrado) {
      this.sorteo = encontrado;
      this.logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/${sorteoId}.png`;
      console.log('📘 Sorteo in PreguntasFrecuentesComponent:', this.sorteo);
    }
  });
}

  logoFallback() {
    console.warn('⚠️ Imagen de logo no encontrada, usando fallback');
    this.logoUrl = 'assets/default-logo.png';
  }
}
