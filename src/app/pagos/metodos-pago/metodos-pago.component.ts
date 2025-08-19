import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sorteo } from '../../state/sorteo/sorteo.model';
import { selectSorteos } from '../../state/sorteo/sorteo.selectors';
import * as BoletoActions from '../../state/evento/evento.actions';
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
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  logoUrl = `https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/`;

  sorteo?: Sorteo;
  boletos$!: Observable<any>;

  
 

  contactarWhatsApp(): void {
    const numero = this.sorteo?.numeroWhatsApp ?? '5216146087479';
    window.open(`https://wa.me/${numero}`, '_blank');
  }
}
