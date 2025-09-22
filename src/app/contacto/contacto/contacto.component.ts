import { Component, inject, OnInit } from '@angular/core';
import { WhatsappButtonComponent } from '../../components/wp/whatsapp-button.component';
import { DibekInformationComponent } from '../../dibek-information/dibek-information.component';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as BoletoActions from '../../state/evento/evento.actions';

import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { combineLatest, Observable } from 'rxjs';
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



}

  logoFallback() {
    console.warn('⚠️ Imagen de logo no encontrada, usando fallback');
    this.logoUrl = 'assets/default-logo.png';
  }
}
