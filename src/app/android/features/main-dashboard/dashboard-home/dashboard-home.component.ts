import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import { Evento } from '../../../../state/evento/evento.model';
import { selectEventosByAdmin } from '../../../../state/evento/evento.selectors';
import * as EventoActions from '../../../../state/evento/evento.actions';

// 👉 Reutilizas los widgets de dashboard que quieras
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { TotalRevenueComponent } from '../total-revenue/total-revenue.component';
import { TotalRafflesComponent } from '../total-raffles/total-raffles.component';
import { TopBuyersComponent } from '../top-buyers/top-buyers.component';
import { TopSellersComponent } from '../top-sellers/top-sellers.component';
import { SalesProgressComponent } from '../sales-progress/sales-progress.component';
import { NextRaffleComponent } from '../next-raffle/next-raffle.component';
import { MenuBottomComponent } from '../../menu-bottom/menu-bottom.component';
import { MenuSettingsComponent } from '../../dashboard/components/menu-settings/menu-settings.component';
import { BtnRegresarComponent } from '../../../../shared/btn-regresar/btn-regresar.component';

@Component({
  selector: 'app-dashboard-eventos',
  standalone: true,
  imports: [
    CommonModule,
    TotalRafflesComponent,
    TotalRevenueComponent,
    TopBuyersComponent,
    TopSellersComponent,
    SalesProgressComponent,
    NextRaffleComponent,
    RecentActivityComponent,
    MenuBottomComponent,
    MenuSettingsComponent,
    BtnRegresarComponent
  ],
templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class MisEventosComponent {
  eventos: Evento[] = [];
  menuAbierto = false;
  actividadReciente: string[] = [];

  constructor(
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    const adminId = Number(localStorage.getItem('adminId'));
    if (!adminId) {
      console.warn('⚠️ No hay adminId en localStorage');
      return;
    }

    // 1. Disparar loadEventos
    this.store.dispatch(EventoActions.loadEventos({ adminId }));

    // 2. Suscribirse a eventos filtrados por admin
    this.store.select(selectEventosByAdmin(adminId))
      .pipe(take(1))
      .subscribe((eventos) => {
        this.eventos = eventos;
        console.log('✅ Eventos cargados para admin:', eventos);

        this.actividadReciente = eventos
          .slice(-5) // los últimos 5
          .map(e => `📅 Evento: ${e.titulo}`);
      });
  }

  abrirEvento(id: number) {
    this.router.navigate(['/evento', id], {
      state: { returnUrl: this.router.url }
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}
