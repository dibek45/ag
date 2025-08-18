import { Component, ElementRef, QueryList, ViewChild, ViewChildren, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TombolaComponent } from './tombola/tombola.component';
import { BoletoItemComponent01 } from '../boletos/boletos-gris01/boleto-item-new-01/boleto-item.component';
import { Store } from '@ngrx/store';
import * as BoletoActions from '../state/boleto/boleto.actions';
import { Boleto } from '../state/boleto/boleto.model';
import { Observable, take } from 'rxjs';
import { selectAllBoletos, selectSelectedBoletos } from '../state/boleto/boleto.selectors';
import { WhatsAppService } from '../services/whatsapp.service';
import { deseleccionarYLiberarBoleto } from '../state/boleto/boleto.actions';
import { ActivatedRoute } from '@angular/router';
import { selectSorteos } from '../state/sorteo/sorteo.selectors';
import { Sorteo } from '../state/sorteo/sorteo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TombolaComponent, BoletoItemComponent01],
  templateUrl: './generate-ticket.component.html',
  styleUrl: './generate-ticket.component.scss'
})
export class GenerateTicketComponent implements OnInit {

  numeroSorteo: string | null = null;
  sorteoId: string = '';

  boletosSeleccionados: Boleto[] = [];
  sorteo: Sorteo | undefined;

  mostrarBotonFinalizar = false;
  mostrarBoton = false;

  tiempo: number = 3;
  tombolaVisible = false;

  numeroDigitos: number = 3;
  numeroSeleccionado: string = ''.padStart(this.numeroDigitos, '0');

  boletos: Boleto[] = [];
  boletos$!: Observable<Boleto[]>;

  @ViewChild('tombolaRef') tombola!: TombolaComponent;

  constructor(
    private store: Store,
    private whatsappService: WhatsAppService,
    private route: ActivatedRoute
  ) { }
ngOnInit(): void {
  this.cargaDesdeStore();
}

cargaDesdeStore() {
  const sorteoIdParam =
    this.route.parent?.snapshot.paramMap.get('numeroSorteo') ??
    this.route.snapshot.paramMap.get('numeroSorteo');

  const sorteoId = Number(sorteoIdParam);
  if (!Number.isFinite(sorteoId)) {
    console.error('❌ sorteoId inválido:', sorteoIdParam);
    return;
  }

  // Guarda ambas formas si las usas en otros selectores/URLs
  this.sorteoId = String(sorteoId);   // para rutas o selectores que piden string
  this.numeroSorteo = this.sorteoId;

  // ✅ Inicializa el observable ANTES de usarlo
  this.boletos$ = this.store.select(selectAllBoletos(sorteoId));

  // Ya puedes suscribirte
  this.boletos$.subscribe(b => {
    this.boletos = b;
    const total = b.length;
    const maxNumero = total - 1;
    this.numeroDigitos = Math.max(2, Math.ceil(Math.log10(maxNumero + 1)));
    this.numeroSeleccionado = ''.padStart(this.numeroDigitos, '0');
    console.log(`🔢 Total boletos: ${total}, dígitos: ${this.numeroDigitos}`);
  });

  // Si tu selector de seleccionados pide string, usa this.sorteoId (string)
  this.store.select(selectSelectedBoletos(this.sorteoId)).subscribe(b => {
    this.boletosSeleccionados = b;
    console.log('🧾 Seleccionados (INIT):', b);
  });

  // Detectar el sorteo en el store (opcional)
  this.store.select(selectSorteos).subscribe((sorteos) => {
    const encontrado = sorteos.find(s => Number(s.id) === sorteoId);
    if (encontrado) {
      this.sorteo = encontrado;
      console.log('🎯 Sorteo detectado en store:', this.sorteo);
    } else {
      console.warn('⚠️ Sorteo no encontrado en store para ID:', sorteoId);
    }
  });

  // (Opcional) cargar desde API solo si es premium, si no hidrata local:
  // const isPremium = JSON.parse(localStorage.getItem('usuario') || '{}')?.plan === 'premium'
  // if (isPremium) this.store.dispatch(BoletoActions.loadBoletos({ sorteoId }));
  // else { /* hidrata desde localStorage si aplica */ }
}

  finalizar() {
    if (!this.boletosSeleccionados.length) {
      alert('❌ No hay boletos seleccionados.');
      return;
    }
    this.whatsappService.confirmarApartadoDeBoletos(this.boletosSeleccionados, Number( this.sorteoId));
  }

  loQuiero() {
    throw new Error('Method not implemented.');
  }

  toggleSeleccion(boleto: Boleto) {
    this.quitarBoletoPorNumero(boleto.numero);
  }

  mostrarTombolaYEmpezar(boletos: Boleto[]) {
    this.mostrarBoton = false;
    this.mostrarBotonFinalizar = false;

    const disponibles = boletos.filter(b => b.estado === 'disponible');

    if (disponibles.length === 0) {
      console.warn('No hay boletos disponibles para sortear');
      return;
    }

    const indice = Math.floor(Math.random() * disponibles.length);
    const numero = disponibles[indice].numero;
    const formateado = numero.toString().padStart(this.numeroDigitos, '0');

    this.numeroSeleccionado = '';

    setTimeout(() => {
      this.numeroSeleccionado = formateado;
      setTimeout(() => {
        this.tombola?.startRolling();
      });
    });
  }

  mostrarBotonApartar() {
    this.mostrarBotonFinalizar = true;
    this.mostrarBoton = true;
    setTimeout(() => {
      this.mostrarBotonFinalizar = false;
    }, 6000);
  }

  apartar() {
    const audio = new Audio('assets/bling.mp3');
    audio.play();

    const numeroFormateado = this.numeroSeleccionado.padStart(this.numeroDigitos, '0');

    const boleto = this.boletos.find(
      b => b.numero.toString().padStart(this.numeroDigitos, '0') === numeroFormateado
    );

    if (!boleto) {
      console.warn('❌ Boleto no encontrado con número:', numeroFormateado);
      return;
    }

    const nuevoEstado = boleto.estado === 'disponible' ? 'ocupado' : boleto.estado;
    const boletoActualizado: Boleto = { ...boleto, estado: nuevoEstado };

    console.log('📤 Despachando al store (apartar):', boletoActualizado);
this.store.dispatch(
  BoletoActions.addBoletoSeleccionado({
    sorteoId: Number(this.sorteoId),
    boleto: boletoActualizado
  })
);

    this.mostrarBoton = false;
    this.mostrarBotonFinalizar = true;
  }

  get boletosOcupados(): Boleto[] {
    return this.boletos.filter(b => b.estado === 'ocupado');
  }

  get boletosDisponibles(): Boleto[] {
    return this.boletos.filter(b => b.estado === 'disponible');
  }

  quitarBoletoPorNumero(numero: string | number) {
    const boleto = this.boletosSeleccionados.find(
      b => String(b.numero) === String(numero)
    );

    if (!boleto) {
      console.warn('⚠️ No se encontró boleto con número:', numero);
      return;
    }
    const confirmado = confirm(`❓ ¿Estás seguro que quieres eliminar el boleto #${String(boleto.numero).padStart(2, '0')}?`);
    if (!confirmado) return;

this.store.dispatch(
  deseleccionarYLiberarBoleto({
    sorteoId: Number(this.sorteoId),
    boletoId: Number(boleto.id)
  })
);
  }
}
