import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SocketService } from './socket.admin.service';
import { take } from 'rxjs/operators';
import { ToastService } from '../../../toast/toast.service';
import { Boleto } from '../../../state/boleto/boleto.model';
import { selectBoletosPorSorteo } from '../../../state/boleto/boleto.selectors';
import { loadBoletosSuccess } from '../../../state/boleto/boleto.actions';

@Injectable({ providedIn: 'root' })
export class BoletoSyncService {
  constructor(
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  listenToSocketUpdates(sorteoId: number) {
    console.log('👂 Suscribiéndome a socket...');

    this.socketService.boletoUpdated$.subscribe((updated: Boleto) => {
      console.log('📨 Recibido en BoletoSyncService:', updated);

      const estadoCapitalizado =
        updated.estado.charAt(0).toUpperCase() + updated.estado.slice(1);
      this.toastService.show(
        `Se actualizó boleto ${updated.numero} a ${estadoCapitalizado}`,
        3000
      );

      if (Number(updated.sorteo?.id) !== Number(sorteoId)) return;

      this.store
        .select(selectBoletosPorSorteo(sorteoId))
        .pipe(take(1))
        .subscribe((boletos) => {
          const existente = boletos.find((b) => b.id === updated.id);

          if (existente && JSON.stringify(existente) === JSON.stringify(updated)) {
            console.log('🔁 Boleto ya estaba igual, no se actualiza store.');
            return;
          }

          const nuevaLista = [
            ...boletos.filter((b) => b.id !== updated.id),
            updated,
          ];

          this.store.dispatch(
            loadBoletosSuccess({ sorteoId, boletos: nuevaLista }) // ✅ CORRECTO
          );
          console.log('✅ Boleto actualizado por socket y actualizado en Redux');
        });
    });
  }



  
}
