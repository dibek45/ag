import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import * as SorteoActions from '../../state/sorteo/sorteo.actions';
import * as BoletoActions from '../../state/evento/evento.actions';
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
