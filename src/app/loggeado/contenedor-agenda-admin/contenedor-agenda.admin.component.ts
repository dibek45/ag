import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import * as EventoActions from '../../state/evento/evento.actions';
import { WhatsappButtonComponent } from '../../components/wp/whatsapp-button.component';
import { MenuSettingsComponent } from '../../android/features/menu-settings/menu-settings.component';
import { BottomNavComponent } from '../../bottom-nav/bottom-nav.component';
import { NavigationService } from '../../android/features/services/navigation.service';
import { Evento } from '../../state/evento/evento.model';
import { selectEventosByEmpresaId } from '../../state/evento/evento.selectors';

@Component({
  selector: 'app-eventos-admin',
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
  isLoggedIn = false;
  eventos: Evento[] = [];
  showSplash = true;
  empresaId!: number;
  menuAbierto = false;
  mostrarMenu = true;
  previousUrl = '/home';

  private navigationService = inject(NavigationService);

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.previousUrl = this.navigationService.getPreviousUrl();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.menuAbierto = false;
      });

    const paramId =
      this.route.snapshot.paramMap.get('empresaId') ??
      this.route.parent?.snapshot.paramMap.get('empresaId');

    this.empresaId = Number(paramId);

    if (!Number.isFinite(this.empresaId)) {
      console.error('❌ invalid empresaId:', paramId);
      return;
    }

    // ✅ cargar eventos de esta empresa
    this.store
      .select(selectEventosByEmpresaId(this.empresaId))
      .pipe(take(1))
      .subscribe((ev) => {
        if (!ev || ev.length === 0) {
          this.store.dispatch(EventoActions.loadEventos({ empresaId: this.empresaId }));
        } else {
          this.eventos = ev;
        }
      });
  }

  logout() {
    this.isLoggedIn = false;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  getBackUrl(): string | null {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/month')) return null;
    if (currentUrl.includes('/day') || currentUrl.includes('/week')) {
      return currentUrl.replace(/(day|week)/, 'month');
    }
    return '/home';
  }
}
