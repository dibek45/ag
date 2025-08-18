import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BoletoItemComponent0InformationCComponent } from '../boletos/boletos-gris01/boleto-item-information/boleto-item.informationcomponent';
import { selectAllBoletos, selectBoletosSeleccionadosPorSorteo, selectSelectedBoletos } from '../state/boleto/boleto.selectors';
import { Boleto } from '../state/boleto/boleto.model';
import { Router, ActivatedRoute } from '@angular/router';
import * as BoletoActions from '../state/boleto/boleto.actions';
import { WhatsAppService } from '../services/whatsapp.service';
import { take } from 'rxjs/operators';
import { Sorteo } from '../state/sorteo/sorteo.model';
import { selectSorteos } from '../state/sorteo/sorteo.selectors';
import { Actions } from '@ngrx/effects';

@Component({
  selector: 'app-buscar-boleto',
  standalone: true,
  imports: [CommonModule, FormsModule, BoletoItemComponent0InformationCComponent],
  templateUrl: './buscar-boleto.component.html',
  styleUrl: './buscar-boleto.component.scss',
})
export class BuscarBoletoComponent implements OnInit {
  termino: string = '';
  boletoEncontrado = signal<Boleto | null>(null);
  boletoDisponible = signal<Boleto | null>(null);
  boletos: Boleto[] = [];
  boletos$!: import('rxjs').Observable<Boleto[]>;
  sorteo?: Sorteo;

  private store = inject(Store);
  private route = inject(ActivatedRoute);

  constructor(
      private actions$: Actions,             // 👈 inject this to listen for success

    private router: Router,
    private whatsappService: WhatsAppService
  ) {}

  ngOnInit() {
  const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
  if (!Number.isFinite(sorteoId)) {
    console.error('❌ Invalid sorteoId in URL:', sorteoId);
    return;
  }

  // keep your current logic…
  this.boletos$ = this.store.select(selectAllBoletos(sorteoId));
  this.store.select(selectAllBoletos(sorteoId)).pipe(take(1)).subscribe(boletos => {
    this.store.select(selectBoletosSeleccionadosPorSorteo(sorteoId)).pipe(take(1)).subscribe(sel => {
      if ((!boletos || boletos.length === 0) && (!sel || sel.length === 0)) {
        this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
      }
    });
  });

  // ✅ this was missing
  this.cargaDesdeStore();
}


 cargaDesdeStore() {
  const sorteoIdParam =
    this.route.snapshot.paramMap.get('numeroSorteo') ??
    this.route.parent?.snapshot.paramMap.get('numeroSorteo');

  const sorteoId = Number(sorteoIdParam);
  console.log('🧪 Param sorteoId recibido:', sorteoId);

  if (!Number.isFinite(sorteoId)) {
    console.error('❌ Invalid sorteoId in the URL:', sorteoId);
    return;
  }

  // 1) Gate API load by store contents (per sorteo)
  this.store.select(selectAllBoletos(sorteoId)).pipe(take(1)).subscribe(boletos => {
    this.store.select(selectBoletosSeleccionadosPorSorteo(sorteoId)).pipe(take(1)).subscribe(sel => {
      if ((!boletos || boletos.length === 0) && (!sel || sel.length === 0)) {
        console.log('📡 Loading boletos from API for sorteoId:', sorteoId);
        this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
      } else {
        console.log('✅ Store already has boletos.');
      }
    });
  });

  // 2) Keep local copy for UI
  this.store.select(selectAllBoletos(sorteoId)).subscribe(arr => {
    this.boletos = arr;                // ← arr is Boleto[]
  });

  // 3) (Optional) pick the sorteo info for UI
  this.store.select(selectSorteos).subscribe(sorteos => {
    const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
    if (encontrado) {
      this.sorteo = encontrado;
      console.log('🎯 Sorteo detectado en store:', this.sorteo);
    }
  });
}


   buscar() {
    const valor = this.termino.trim();
    const numeroBuscado = Number(valor);
    if (!Number.isFinite(numeroBuscado)) {
      console.warn('⚠️ Not a valid number');
      this.boletoEncontrado.set(null);
      this.boletoDisponible.set(null);
      return;
    }

    const resultado = this.boletos.find(b => Number(b.numero) === numeroBuscado);

    if (resultado) {
      if (resultado.estado === 'disponible') {
        this.boletoDisponible.set(resultado);
        this.boletoEncontrado.set(null);
      } else {
        this.boletoEncontrado.set(resultado);
        this.boletoDisponible.set(null);
      }
    } else {
      this.boletoEncontrado.set(null);
      this.boletoDisponible.set(null);
    }
  }

  apartarParaMi(boleto: Boleto) {
    if (boleto.estado !== 'disponible') {
      console.warn('⚠️ Este boleto no está disponible para apartar');
      return;
    }

    this.whatsappService.abrirModalYEnviarUnBoleto(boleto).then((boletoActualizado) => {
  if (!boletoActualizado) {
    console.warn('❌ El usuario canceló el modal');
    return;
  }

  console.log('📞 Teléfono que se va a mandar:', boletoActualizado.comprador?.telefono);
  console.log('🙋‍♂️ Nombre que se va a mandar:', boletoActualizado.comprador?.nombre);

  this.whatsappService.apartarUnBoleto(
    boletoActualizado.comprador!.nombre,
    boletoActualizado.comprador!.telefono,
    boletoActualizado
  );


this.store.dispatch(
  BoletoActions.addBoletoSeleccionado({
    sorteoId: Number(boletoActualizado.sorteo?.id), // ensure number
    boleto: boletoActualizado,
  })
);

      this.boletoDisponible.set(null);
      this.termino = String(boleto.numero);
      this.buscar();
    });
  }

  limpiar() {
    this.termino = '';
    this.boletoEncontrado.set(null);
    this.boletoDisponible.set(null);
  }

  volverABoletos() {
    const sorteoId = this.sorteo?.id || 'boletos';
    this.router.navigate([`/${sorteoId}/boletos`]);
  }

  // SVG Ticket (sin tocar)
  ticketSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <path d="..." fill="#b1cb56ff"/>
  <text x="50%" y="100" text-anchor="middle" fill="#f9b700" font-family="Arial" font-size="20" font-weight="bold">🎟️ BOLETO GENERADO</text>
  <text x="50%" y="130" text-anchor="middle" fill="#f9b700" font-size="16" font-weight="bold">👩‍🦰 {{rifa}}</text>
  <text x="50%" y="170" text-anchor="middle" fill="#f9b700">Número del boleto:</text>
  <text x="50%" y="190" text-anchor="middle" fill="#f9b700" font-size="28" font-weight="bold">{{numero}}</text>
  <text x="50%" y="220" text-anchor="middle" fill="#f9b700">Nombre del participante:</text>
  <text x="50%" y="240" text-anchor="middle" fill="#f9b700" font-weight="bold">{{nombre}}</text>
  <text x="50%" y="270" text-anchor="middle" fill="#f9b700">📍 {{estado}}</text>
  <text x="50%" y="300" text-anchor="middle" fill="#f9b700">🗓️ {{fecha}}</text>
  <text x="50%" y="330" text-anchor="middle" fill="#f9b700" font-size="12">Introduce tu número y visita:</text>
  <text x="50%" y="350" text-anchor="middle" fill="#f9b700" font-size="12">{{sitio}}</text>
</svg>
`;
}
