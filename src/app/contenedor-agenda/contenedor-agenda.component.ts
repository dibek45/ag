import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { WhatsappButtonComponent } from '../components/wp/whatsapp-button.component';
import { MenuSettingsComponent } from '../android/features/menu-settings/menu-settings.component';
import { BtnRegresarComponent } from '../shared/btn-regresar/btn-regresar.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { NavigationService } from '../android/features/services/navigation.service';
import { ScheduleComponent } from '../schedule/schedule.component';
import { Evento } from '../state/evento/evento.model';
import { selectAllEventos } from '../state/evento/evento.selectors';
import * as EventoActions from '../state/evento/evento.actions';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    ScheduleComponent,
    RouterModule,
    WhatsappButtonComponent,
    MenuSettingsComponent,
    BtnRegresarComponent,
    BottomNavComponent
  ],
  templateUrl: './contenedor-agenda.component.html',
  styleUrl: './contenedor-agenda.component.scss'
})
export class EventosComponent implements OnInit {
buscarBoleto() {
throw new Error('Method not implemented.');
}
  eventos: Evento[] = [];
  showSplash = true;
  adminId!: number;
  menuAbierto: boolean = false;
  mostrarMenu = true;
  private navigationService = inject(NavigationService);
  previousUrl = '/home';

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.previousUrl = this.navigationService.getPreviousUrl();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.menuAbierto = false;   // cerrar menú en navegación
      });

    const paramId =
      this.route.snapshot.paramMap.get('adminId') ??
      this.route.parent?.snapshot.paramMap.get('adminId');

    this.adminId = Number(paramId);

    if (!Number.isFinite(this.adminId)) {
      console.error('❌ invalid adminId:', paramId);
      return;
    }

    // ✅ cargar eventos de este admin
    this.store
      .select(selectAllEventos)
      .pipe(take(1))
      .subscribe((ev) => {
        if (!ev || ev.length === 0) {
          this.store.dispatch(EventoActions.loadEventos({ adminId: this.adminId }));
        }
      });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  getBackUrl(): string | null {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/month')) {
      return null; // no navegar
    }

    if (currentUrl.includes('/day') || currentUrl.includes('/week')) {
      return currentUrl.replace(/(day|week)/, 'month');
    }

    return '/home';
  }
}
