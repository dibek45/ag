import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Boleto } from '../state/boleto/boleto.model';
import { loadBoletosSuccess } from '../state/boleto/boleto.actions';
import { SocketService } from './socket.service';
import { selectAllBoletos, selectBoletosSeleccionados } from '../state/boleto/boleto.selectors';
import { take } from 'rxjs/operators';
import { ToastService } from '../toast/toast.service';

@Injectable({ providedIn: 'root' })
export class BoletoSyncService {
  private boletosDesactivados: Boleto[] = [];
  private toastTimeout: any = null;

  constructor(
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  public telefonoTemporalComprador: string | null = null;


  listenToSocketUpdates(sorteoId: number) {
    console.log('👂 Suscribiéndome a socket...');

    this.socketService.boletoUpdated$.subscribe((updated: Boleto) => {
      console.log('📨 Recibido en BoletoSyncService:', updated);

      if (Number(updated.sorteo?.id) !== Number(sorteoId)) {
        console.warn('🚫 Sorteo no coincide, ignorado.');
        return;
      }

      this.store
  .select(selectAllBoletos(sorteoId))   // ← pass the id
  .pipe(take(1))
  .subscribe((boletos) => {
    const existente = boletos.find(b => b.id === updated.id);

    if (existente && JSON.stringify(existente) === JSON.stringify(updated)) {
      console.log('🔁 Boleto ya estaba igual, no se actualiza store.');
      return;
    }

        // Verificar si está seleccionado y ya no está disponible
        
 this.store
  .select(selectBoletosSeleccionados(sorteoId))
  .pipe(take(1))
  .subscribe((seleccionados) => {
    const lista = seleccionados as Boleto[]; // 👈 forzamos tipo aquí

    const yaNoDisponible = lista.find(
      (b) => b.id === updated.id && updated.estado !== 'disponible'
    );
    if (yaNoDisponible) {
      console.warn(`❌ El boleto #${updated.numero} ya no está disponible y estaba seleccionado.`);

      this.store.dispatch({ type: '[Boleto] Deseleccionar Boletos', ids: [updated.id] });
      console.log(`🧹 Dispatched deselección del boleto ID #${updated.id}`);

      const telefono = updated.comprador?.telefono;
      const soyYo = telefono && telefono === this.telefonoTemporalComprador;

      console.log(`📞 Teléfono comprador del boleto: ${telefono}`);
      console.log(`📞 Teléfono temporal mío: ${this.telefonoTemporalComprador}`);
      console.log(`🙋 ¿Fui yo?`, soyYo);

      if (!soyYo) {
        console.log(`📛 Otro usuario lo apartó. Agregando #${updated.numero} al toast.`);
        this.boletosDesactivados.push(updated);

        if (this.toastTimeout) {
          console.log('⏱️ Reiniciando timeout de toast anterior.');
          clearTimeout(this.toastTimeout);
        }

        this.toastTimeout = setTimeout(() => {
          const numeros = this.boletosDesactivados.map((b) => b.numero).join(', ');
          console.log(`📢 Mostrando toast con boletos no disponibles: ${numeros}`);
          this.toastService.showBoletoNoDisponibleToast(numeros);
          this.boletosDesactivados = [];
        }, 500);
      } else {
        console.log(`🙋 Yo lo aparté (#${updated.numero}), no se muestra toast.`);
      }
    } else {
      console.log(`✅ El boleto #${updated.numero} no estaba seleccionado o sigue disponible.`);
    }
  });



this.store
  .select(selectAllBoletos(sorteoId)) // ⬅ aquí lo invocas
  .pipe(take(1))
  .subscribe((boletos) => {
    const nuevaLista: Boleto[] = [
      ...boletos.filter((b) => b.id !== updated.id),
      updated
    ];

    this.store.dispatch(
      loadBoletosSuccess({ sorteoId, boletos: nuevaLista })
    );
  });


        console.log('✅ Boleto actualizado por socket y actualizado en Redux');
      });
    });
  }
}
