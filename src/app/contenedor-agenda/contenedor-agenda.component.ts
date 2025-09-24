import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { WhatsappButtonComponent } from '../components/wp/whatsapp-button.component';
import { MenuSettingsComponent } from '../android/features/menu-settings/menu-settings.component';
import { BtnRegresarComponent } from '../shared/btn-regresar/btn-regresar.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { NavigationService } from '../android/features/services/navigation.service';

import { Evento } from '../state/evento/evento.model';
import * as EventoActions from '../state/evento/evento.actions';
import { selectEventosByEmpresaId } from '../state/evento/evento.selectors';

import * as EmpresaActions from '../state/empresa/empresa.actions';
import { EmpresaInfoComponent } from './empresa-info-component/empresa-info-component.component';
import { selectEmpresaById } from '../state/empresa/empresa.selectors';
import { Empresa } from '../state/empresa/empresa.model';
import { LoginAgendaComponent } from './login-agenda/login-agenda.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    WhatsappButtonComponent,
    MenuSettingsComponent,
    BottomNavComponent,
    LoginAgendaComponent,
    BtnRegresarComponent,
    EmpresaInfoComponent
  ],
  templateUrl: './contenedor-agenda.component.html',
  styleUrl: './contenedor-agenda.component.scss'
})
export class ContenedorAgendaComponent implements OnInit {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  isLoggedIn = false;
  showLoginModal = false;

  eventos: Evento[] = [];
  empresaId!: number;
  empresaSeleccionada$!: Observable<Empresa | undefined>; // ✅ observable tipado

  showSplash = true;
  menuAbierto = false;
  mostrarMenu = true;
  previousUrl = '/home';

  private navigationService = inject(NavigationService);

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {
    const companyName = this.route.snapshot.paramMap.get('companyName');
    console.log('Empresa seleccionada:', companyName);
  }

 ngOnInit(): void {
  this.previousUrl = this.navigationService.getPreviousUrl();

  this.router.events.pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      this.menuAbierto = false;
    });

  console.log("📌 URL actual:", this.router.url);

  const paramId =
    this.route.snapshot.paramMap.get('adminId') ??
    this.route.parent?.snapshot.paramMap.get('adminId');

  console.log("📌 Param adminId leído:", paramId);

  this.empresaId = Number(paramId);
  console.log("📌 empresaId numérico:", this.empresaId);

  if (!Number.isFinite(this.empresaId)) {
    console.error('❌ invalid empresaId:', paramId);
    return;
  }

  // 🚀 cargar empresas si aún no existen en el store
  this.store.dispatch(EmpresaActions.loadEmpresas());

  // 📌 seleccionar empresa actual
  this.empresaSeleccionada$ = this.store.select(selectEmpresaById(this.empresaId));
  this.empresaSeleccionada$.subscribe(emp => {
    console.log("🏢 Empresa desde store:", emp);
  });

  // 🚀 cargar eventos de la empresa/admin
  this.store
    .select(selectEventosByEmpresaId(this.empresaId))
    .pipe(take(1))
    .subscribe((ev) => {
      console.log("📌 Eventos obtenidos del store:", ev);

      if (!ev || ev.length === 0) {
        console.log("📌 No había eventos en store → dispatch loadEventos");
        this.store.dispatch(EventoActions.loadEventos({ empresaId: this.empresaId }));
      } else {
        console.log("📌 Ya existían eventos en store:", ev);
        this.eventos = ev;
      }
    });
}



  goToLogin() { this.showLoginModal = true; }
  handleLoginSuccess() {
    this.isLoggedIn = true;
    this.showLoginModal = false;
    this.router.navigate(['/home']);
  }
  logout() { this.isLoggedIn = false; }
  toggleMenu() { this.menuAbierto = !this.menuAbierto; }

  getBackUrl(): string | null {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/month')) return null;
    if (currentUrl.includes('/day') || currentUrl.includes('/week')) {
      return currentUrl.replace(/(day|week)/, 'month');
    }
    return '/home';
  }
}
