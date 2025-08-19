import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastService } from '../toast/toast.service';
import { SocketService } from '../sockets/socket.service';
import { Evento } from '../state/evento/evento.model';
import * as EventoActions from '../state/evento/evento.actions';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EventoSocketManager {
  private socketConectado = false;

  constructor(
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  conectar(adminId: number) {
    if (this.socketConectado) return;

    // unir al room del admin
    this.socketService.joinAdminRoom(adminId);
    this.socketConectado = true;

    // escuchar eventos
    this.socketService.eventoUpdated$.subscribe((eventoActualizado: Evento) => {
      console.log('📨 eventoUpdated recibido:', eventoActualizado);

      this.store.dispatch(
        EventoActions.updateEventoSuccess({ evento: eventoActualizado })
      );

      this.toastService.show(
        `📅 Evento actualizado: ${eventoActualizado.titulo}`,
        3000
      );
    });

    this.socketService.eventoDeleted$.subscribe((eventoId: number) => {
      console.log('🗑 eventoDeleted recibido:', eventoId);

      this.store.dispatch(EventoActions.deleteEventoSuccess({ id: eventoId }));

      this.toastService.show(`🗑 Evento eliminado`, 3000);
    });
  }
}
