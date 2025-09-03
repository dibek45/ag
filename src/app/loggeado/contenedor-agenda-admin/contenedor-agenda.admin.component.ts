import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


import { ScheduleComponent } from '../schedule/schedule.component';

import * as EventoActions from '../../state/evento/evento.actions';
import { WhatsappButtonComponent } from '../../components/wp/whatsapp-button.component';
import { MenuSettingsComponent } from '../../android/features/menu-settings/menu-settings.component';
import { BottomNavComponent } from '../../bottom-nav/bottom-nav.component';
import { NavigationService } from '../../android/features/services/navigation.service';
import { Evento } from '../../state/evento/evento.model';
import { selectAllEventos } from '../../state/evento/evento.selectors';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WhatsappButtonComponent,
    MenuSettingsComponent,
    BottomNavComponent
  ],
  templateUrl: './contenedor-agenda.admin.component.html',
  styleUrl: './contenedor-agenda.admin.component.scss'
})
export class EventosComponentAdmin implements OnInit {


  isLoggedIn = false; // simulado, cámbialo según tu AuthService
  
 goToLogin() {
    this.isLoggedIn = true;   // al presionar login simula autenticación
  }

  logout() {
    this.isLoggedIn = false;  // 👈 opcional, para probar logout
  }
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
