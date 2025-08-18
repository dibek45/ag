import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as BoletoActions from '../state/boleto/boleto.actions';
import { Boleto } from '../state/boleto/boleto.model';
import { selectAllBoletos } from '../state/boleto/boleto.selectors';
import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { PrizeInfoComponent } from '../components/prize-info/prize-info.component';
import { BonosComponent } from '../components/boletos/bonos.component';
import { BoletoGrid01Component } from './boletos-gris01/boleto-grid.component';
import { ResumenComponent } from '../components/resumen/resumen.component';
import { WhatsappButtonComponent } from '../components/wp/whatsapp-button.component';
import { MenuSettingsComponent } from '../android/features/dashboard/components/menu-settings/menu-settings.component';
import { BtnRegresarComponent } from '../shared/btn-regresar/btn-regresar.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { NavigationService } from '../android/features/services/navigation.service';
import { ScheduleComponent } from '../schedule/schedule.component';

@Component({
  selector: 'app-boletos',
  standalone: true,
  imports: [
    CommonModule,
  ScheduleComponent,
  RouterModule,
    WhatsappButtonComponent,
    MenuSettingsComponent, BtnRegresarComponent,BottomNavComponent
  ],
  templateUrl: './boletos.component.html',
  styleUrl: './boletos.component.scss'
})
export class BoletosComponent implements OnInit {
  boletosSeleccionados: Boleto[] = [];
  showSplash = true;
  numeroSorteo!: string;
  menuAbierto: boolean = false;
  mostrarMenu = true;
  private navigationService = inject(NavigationService);
  previousUrl = '/home';
  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute
  ) {}

 sorteoId!: number;   // <- number, not string

 ngOnInit(): void {
    this.previousUrl = this.navigationService.getPreviousUrl();
    console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww")
    console.log(this.navigationService.getPreviousUrl())

  this.router.events.pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      this.menuAbierto = false;   // close the menu on page enter
    });
  const paramId =
    this.route.snapshot.paramMap.get('numeroSorteo') ??
    this.route.parent?.snapshot.paramMap.get('numeroSorteo');

  this.sorteoId = Number(paramId);
  this.numeroSorteo = String(this.sorteoId); // ✅ set it

  if (!Number.isFinite(this.sorteoId)) {
    console.error('❌ invalid sorteoId:', paramId);
    return;
  }

  // ✅ Hide menu if coming via invitation (query ?code=) or guest
  const cameWithCode = !!this.route.snapshot.queryParamMap.get('code');
  const isGuest = localStorage.getItem('estadoCuenta') === 'invitado';
  this.mostrarMenu = !(cameWithCode );

  this.store
    .select(selectAllBoletos(this.sorteoId))
    .pipe(take(1))
    .subscribe((b) => {
      if (!b || b.length === 0) {
        this.store.dispatch(BoletoActions.loadBoletos({ sorteoId: this.sorteoId }));
      }
    });
}


  onSeleccionCambio(seleccionados: Boleto[]) {
    this.boletosSeleccionados = seleccionados;
    seleccionados.forEach(boleto => {
      this.store.dispatch(
        BoletoActions.addBoletoSeleccionado({
          sorteoId: this.sorteoId,         // ✅ include sorteoId
          boleto
        })
      );
    });
  }


    buscarBoleto() {
    const ruta = `/${this.numeroSorteo}/buscar-boleto`;
    console.log('🔎 Navegando a:', ruta);
    this.router.navigate([ruta]);
  }

  irAGenerarTicket() {
    const ruta = `/${this.numeroSorteo}/generateTicket`;
    console.log('🎫 Navegando a:', ruta);
    this.router.navigate([ruta]);
  }

  seleccionarAleatorios() {
    throw new Error('Method not implemented.');
  }


  
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }



getBackUrl(): string | null {
  const currentUrl = this.router.url;

  if (currentUrl.includes('/month')) {
    return null; // 👈 indica que no hay navegación
  }

  if (currentUrl.includes('/day') || currentUrl.includes('/week')) {
    return currentUrl.replace(/(day|week)/, 'month');
  }

  return '/home'; // valor por defecto
}

}