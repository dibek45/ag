import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

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

  
  
}



}
