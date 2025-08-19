import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Evento } from '../../../state/evento/evento.model';
import { selectAllEventos } from '../../../state/evento/evento.selectors';
import { loadEventosSuccess } from '../../../state/evento/evento.actions';
import { ToastService } from '../../../toast/toast.service';
import { SocketService } from '../../../sockets/socket.service';

@Injectable({ providedIn: 'root' })
export class EventoSyncService {
  constructor(
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  listenToSocketUpdates(adminId: number) {
    console.log('👂 Suscribiéndome a socket de eventos...');

    this.socketService.eventoUpdated$.subscribe((updated: Evento) => {
      console.log('📨 Recibido en EventoSyncService:', updated);

      // ✅ verificamos que sea del admin correcto
      if (Number(updated.admin?.id) !== Number(adminId)) {
        console.warn('🚫 Evento ignorado: adminId no coincide.');
        return;
      }

      this.toastService.show(
        `Se actualizó evento "${updated.titulo}"`,
        3000
      );

      this.store
        .select(selectAllEventos)
        .pipe(take(1))
        .subscribe((eventos) => {
          const existente = eventos.find((e) => e.id === updated.id);

          if (existente && JSON.stringify(existente) === JSON.stringify(updated)) {
            console.log('🔁 Evento ya estaba igual, no se actualiza store.');
            return;
          }

          const nuevaLista = [
            ...eventos.filter((e) => e.id !== updated.id),
            updated,
          ];

          this.store.dispatch(
            loadEventosSuccess({ eventos: nuevaLista }) // ✅ usamos la acción de eventos
          );

          console.log('✅ Evento actualizado por socket y guardado en store.');
        });
    });
  }
}
