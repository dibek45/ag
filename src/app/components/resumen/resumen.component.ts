import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Boleto } from '../../state/boleto/boleto.model';
import { selectBoletosSeleccionados, selectBoletosSeleccionadosPorSorteo } from '../../state/boleto/boleto.selectors';
import { WhatsAppService } from '../../services/whatsapp.service';

import { BoletoItemComponent01 } from '../../boletos/boletos-gris01/boleto-item-new-01/boleto-item.component';
import * as BoletoActions from '../../state/boleto/boleto.actions';
import { deseleccionarYLiberarBoleto } from '../../state/boleto/boleto.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { WhatsAppRIfasService } from '../../services/whatsapp.rifas.service';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule,BoletoItemComponent01],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.scss',
})
export class ResumenComponent {

  private store = inject(Store);
  private route = inject(ActivatedRoute);
  sorteoId:number=0;
  private destroyRef = inject(DestroyRef);  boletosSeleccionados = signal<Boleto[]>([]);
 constructor(private whatsappService: WhatsAppService,private whatsappServicePrmium: WhatsAppRIfasService) {
    const sorteoId = Number(this.route.parent?.snapshot.paramMap.get('numeroSorteo'));
this.sorteoId=sorteoId;
    this.store
      .select(selectBoletosSeleccionadosPorSorteo(sorteoId))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((boletos) => {
        console.log('[ResumenComponent] Boletos seleccionados:', boletos);
        this.boletosSeleccionados.set(boletos);
      });
  }
get total(): number {
  return this.boletosSeleccionados().reduce((acc, boleto) => acc + (boleto.precio || 0), 0);
}


  get numerosSeleccionados(): string {
    return this.boletosSeleccionados()
      .map((b) => b.numero)
      .join(', ');
  }

quitarBoletoPorNumero(numero: string | number) {
  console.log('🔍 Buscando boleto con número:', numero);

  console.log('🔎 Tipos:', typeof numero, typeof this.boletosSeleccionados()[0]?.numero);
  console.table(this.boletosSeleccionados().map(b => b.numero));

  const boleto = this.boletosSeleccionados().find(
    b => String(b.numero) === String(numero)
  );

  if (!boleto) {
    console.warn('⚠️ No se encontró boleto con número:', numero);
    return;
  }

  const confirmado = confirm(`❓ ¿Estás seguro que quieres eliminar el boleto #${String(boleto.numero).padStart(2, '0')}?`);

  if (!confirmado) {
    console.log('❌ Eliminación cancelada por el usuario.');
    return;
  }

  console.log('✅ Boleto encontrado:', boleto);
this.store.dispatch(
  deseleccionarYLiberarBoleto({
    sorteoId: Number(boleto.sorteo?.id), // 👈 ensure number
    boletoId: Number(boleto.id)           // 👈 ensure number
  })
);
  console.log('📤 Despachado deseleccionarYLiberarBoleto con id:', boleto.id);
}



confirmar() {
  const estadoCuenta = localStorage.getItem('estadoCuenta'); // premium, free, invitado...

  if (estadoCuenta === 'premium') {
    console.log('🌟 Cuenta premium → usando WhatsApp Rifas Service');
    this.whatsappServicePrmium.confirmarApartadoDeBoletos(
      this.boletosSeleccionados(),
    );
  } else {
    console.log('🆓 Cuenta normal → usando WhatsApp Service normal');
    this.whatsappService.confirmarApartadoDeBoletos(
      this.boletosSeleccionados(),
      this.sorteoId
    );
  }
}



}

