import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Evento } from '../state/evento/evento.model';
import { SocketService } from './socket.service';
import { selectAllEventos } from '../state/evento/evento.selectors';
import { take } from 'rxjs/operators';
import { ToastService } from '../toast/toast.service';
import * as EventoActions from '../state/evento/evento.actions';

@Injectable({ providedIn: 'root' })
export class EventoSyncService {
  constructor(
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  listenToSocketUpdates(adminId: number) {
    console.log('👂 Escuchando socket de eventos...');

    // 🔄 Cuando llega actualización de evento
    this.socketService.eventoUpdated$.subscribe((updated: Evento) => {
      console.log('📨 Recibido evento por socket:', updated);

      if (Number(updated.admin?.id) !== Number(adminId)) {
        console.warn('🚫 Admin no coincide, ignorado.');
        return;
      }

      this.store
        .select(selectAllEventos)
        .pipe(take(1))
        .subscribe((eventos) => {
          const existente = eventos.find((e) => e.id === updated.id);

          if (existente) {
            console.log(`🔁 Evento #${updated.id} ya existía, se actualiza.`);
            this.store.dispatch(EventoActions.updateEventoSuccess({ evento: updated }));
            this.toastService.show(`📅 Evento actualizado: ${updated.titulo}`, 3000);
          } else {
            console.log(`🆕 Nuevo evento detectado #${updated.id}.`);
            this.store.dispatch(
              EventoActions.loadEventosSuccess({ eventos: [...eventos, updated] })
            );
            this.toastService.show(`➕ Nuevo evento agregado: ${updated.titulo}`, 3000);
          }
        });
    });

    // 🗑️ Cuando llega evento eliminado
    this.socketService.eventoDeleted$.subscribe((deletedId: number) => {
      console.log('🗑️ Evento eliminado:', deletedId);
      this.store.dispatch(EventoActions.deleteEventoSuccess({ id: deletedId }));
      this.toastService.show(`❌ Evento eliminado #${deletedId}`, 3000);
    });
  }
}
