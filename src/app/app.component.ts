import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { SplashScreenComponent } from './splash/splash-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,SplashScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

   cargando = true;

  ngOnInit() {
    setTimeout(() => this.cargando = false, 1500);
  }
  
  /*
ngOnInit(): void {
  const rutasConSocket = ['boletos', 'generateTicket', 'buscar-boleto', 'faq', 'preguntas-frecuentes'];

  const currentUrl = this.router.url;
  const match = currentUrl.match(/^\/(\d+)/);
  const sorteoId = match ? Number(match[1]) : null;

  console.log('🌐 URL actual:', currentUrl);
  console.log('🎯 Sorteo ID detectado:', sorteoId);

  if (sorteoId) {
    const enRutaInicialHabilitada = rutasConSocket.some(r => currentUrl.includes(r));

    if (enRutaInicialHabilitada && !this.socketConectado) {
      this.boletoSyncService.listenToSocketUpdates(sorteoId);
      this.socketService.joinSorteoRoom(sorteoId);
      this.socketConectado = true;
      console.log(`🟢 Socket conectado a sala del sorteo ${sorteoId}`);
    }

    // 👂 Escuchar cambios en boletos desde socket
    this.socketService.boletoUpdated$.subscribe((boletoActualizado) => {
  console.log('📨 Boleto actualizado por socket:', boletoActualizado);

  this.store.select(selectBoletosSeleccionados).pipe(take(1)).subscribe((seleccionados) => {
    console.log('🧾 Seleccionados actuales:', seleccionados.map(b => ({
      id: b.id,
      numero: b.numero,
      estado: b.estado
    })));

    const yaNoDisponible = seleccionados.find(
      b => b.id === boletoActualizado.id && boletoActualizado.estado !== 'disponible'
    );

    if (yaNoDisponible) {
      console.warn('⚠️ Boleto seleccionado ya no está disponible:', yaNoDisponible.numero);
      this.store.dispatch(BoletoActions.deseleccionarBoletos({ ids: [boletoActualizado.id] }));
      this.toastService.show(`❌ Boleto ${yaNoDisponible.numero} ya no está disponible (${boletoActualizado.estado})`, 4000);
    } else {
      console.log('✅ Boleto no afecta a seleccionados o sigue disponible.');
    }
  });
});

  }

  // 📍 Detectar navegación y reconectar socket si hace falta
  this.router.events
    .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    .subscribe((event) => {
      this.tipoMenu = event.url.includes('boletos') ? 2 : 1;

      const nuevaUrl = event.url;
      const nuevaMatch = nuevaUrl.match(/^\/(\d+)/);
      const nuevoSorteoId = nuevaMatch ? Number(nuevaMatch[1]) : null;

      const enRutaHabilitada = rutasConSocket.some(r => nuevaUrl.includes(r));

      console.log('📍 NavigationEnd:', nuevaUrl);
      console.log('🎯 Nuevo sorteo ID:', nuevoSorteoId);

      if (enRutaHabilitada && !this.socketConectado && nuevoSorteoId) {
        this.boletoSyncService.listenToSocketUpdates(nuevoSorteoId);
        this.socketService.joinSorteoRoom(nuevoSorteoId);
        this.socketConectado = true;
        console.log(`🟢 Socket conectado desde NavigationEnd a sala ${nuevoSorteoId}`);
      }
    });
}
*/
}