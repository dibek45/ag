import { Store } from "@ngrx/store";
import { BoletoSyncService } from "../sockets/boleto-sync.service";
import { ToastService } from "../toast/toast.service";
import { SocketService } from "../sockets/socket.service";
import { selectBoletosSeleccionados } from "../state/boleto/boleto.selectors";
import { Injectable } from "@angular/core";
import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs/operators';
import * as BoletoActions from '../state/boleto/boleto.actions';

import { toSignal } from '@angular/core/rxjs-interop';
@Injectable({ providedIn: 'root' })
export class SorteoSocketManager {
  private socketConectado = false;

  constructor(
    private boletoSyncService: BoletoSyncService,
    private socketService: SocketService,
    private store: Store,
    private toastService: ToastService
  ) {}

  conectar(sorteoId: number) {
    if (this.socketConectado) return;
    this.boletoSyncService.listenToSocketUpdates(sorteoId);
    this.socketService.joinSorteoRoom(sorteoId);
    this.socketConectado = true;

    this.socketService.boletoUpdated$.subscribe(boletoActualizado => {
      this.store.select(selectBoletosSeleccionados).pipe(take(1)).subscribe(seleccionados => {
        const yaNoDisponible = seleccionados.find(
          b => b.id === boletoActualizado.id && boletoActualizado.estado !== 'disponible'
        );
        if (yaNoDisponible) {
          this.store.dispatch(BoletoActions.deseleccionarBoletos({ ids: [boletoActualizado.id] }));
          this.toastService.show(`❌ Boleto ${yaNoDisponible.numero} ya no está disponible`, 4000);
        }
      });
    });
  }
}
