    import { Injectable } from '@angular/core';
    import io  from 'socket.io-client'; // ✅ Solo importa `io`, no `Socket`
    import { Subject } from 'rxjs';
    import { Boleto } from '../state/boleto/boleto.model';
import { environment } from '../environments/environment';

    @Injectable({
    providedIn: 'root',
    })
    export class SocketService {

        
    private socket = io(environment.socketUrl, {
        transports: ['websocket'],
    });

    private sorteoId: number | null = null;

    // Subject para actualizar boletos
    public boletoUpdated$ = new Subject<Boleto>();

    constructor() {
        this.socket.on('connect', () => {
        console.log('🟢 Conectado a WebSocket'+this.sorteoId);
        if (this.sorteoId) {
            this.joinSorteoRoom(this.sorteoId);
              console.log(`🎟️ Unido a la sala del sorteo: sorteo-${this.sorteoId}`); // ✅ aquí sí ya está definido

        }

                      console.log(``); // ✅ aquí sí ya está definido

        });

        this.socket.on('disconnect', () => {
        console.log('🔴 Desconectado de WebSocket');
        });

        this.listenToSocketEvents();
    }

    private listenToSocketEvents(): void {
        this.socket.on('boletoUpdated', (boleto: Boleto) => {
        console.log('📨 Evento boletoUpdated recibido:', boleto);
        this.boletoUpdated$.next(boleto);
        });
    }

    emit(event: string, data: any): void {
        this.socket.emit(event, data);
    }

    public joinSorteoRoom(sorteoId: number): void {
        this.sorteoId = sorteoId;
        this.socket.emit('joinSorteo', sorteoId);
        console.log(`🎟️       🎟️                 🎟️🎟️🎟️🎟️🎟️🎟️🎟️🎟️joinSorteoRoomUnido a la sala del sorteo: sorteo-${sorteoId}`);
    }
    }
