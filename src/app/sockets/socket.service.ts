import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Subject } from 'rxjs';
import { Evento } from '../state/evento/evento.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = io(environment.socketUrl, {
    transports: ['websocket'],
  });

  private sorteoId: number | null = null;
  private adminId: number | null = null;

  // 🎟️ Boletos

  // 📅 Eventos
  public eventoUpdated$ = new Subject<Evento>();
  public eventoDeleted$ = new Subject<number>();

  constructor() {
    this.socket.on('connect', () => {
      console.log('🟢 Conectado a WebSocket');

      if (this.sorteoId) {
        this.joinSorteoRoom(this.sorteoId);
      }

      if (this.adminId) {
        this.joinAdminRoom(this.adminId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Desconectado de WebSocket');
    });

    this.listenToSocketEvents();
  }

  // ---------------------------
  // Escucha de eventos socket
  // ---------------------------
  private listenToSocketEvents(): void {
    // 🔹 Boletos
 

    // 🔹 Eventos
    this.socket.on('eventoUpdated', (evento: Evento) => {
      console.log('📨 eventoUpdated recibido:', evento);
      this.eventoUpdated$.next(evento);
    });

    this.socket.on('eventoDeleted', (eventoId: number) => {
      console.log('🗑️ eventoDeleted recibido:', eventoId);
      this.eventoDeleted$.next(eventoId);
    });
  }

  // ---------------------------
  // Métodos públicos
  // ---------------------------
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  public joinSorteoRoom(sorteoId: number): void {
    this.sorteoId = sorteoId;
    this.socket.emit('joinSorteo', sorteoId);
    console.log(`🎟️ Unido a la sala del sorteo: sorteo-${sorteoId}`);
  }

  public joinAdminRoom(adminId: number): void {
    this.adminId = adminId;
    this.socket.emit('joinAdmin', adminId);
    console.log(`📅 Unido a la sala del admin: admin-${adminId}`);
  }
}
