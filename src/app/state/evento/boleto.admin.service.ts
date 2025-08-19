import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Evento } from './evento.model';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'https://api.agenda.sa.dibeksolutions.com/eventos';

  constructor(private http: HttpClient) {}

  // -------------------------
  // PUBLIC
  // -------------------------

  /**
   * Obtener todos los eventos de un admin
   */
  getEventos(adminId: number): Observable<Evento[]> {
    const esPremium = this.isPremium();
    console.log(`⏳ getEventos(${adminId}) [premium=${esPremium}]`);

    if (esPremium) {
      // 👑 PREMIUM → API
      return this.http.get<Evento[]>(`${this.apiUrl}/admin/${adminId}`).pipe(
        tap(e => console.log('✅ API eventos:', e)),
        catchError(err => {
          console.error('❌ Error API getEventos:', err);
          return of([]); // no rompas la app
        })
      );
    }

    // 🟡 FREE/GUEST → LOCAL
    const eventos = this.loadLocalEventos(adminId);
    return of(eventos);
  }

  /**
   * Crear evento nuevo
   */
  createEvento(evento: Evento): Observable<Evento> {
    const esPremium = this.isPremium();

    if (esPremium) {
      return this.http.post<Evento>(`${this.apiUrl}`, evento).pipe(
        tap(e => console.log('✅ API evento creado:', e))
      );
    }

    // LOCAL
    const eventos = this.loadLocalEventos(evento.admin.id);
    const nuevo = { ...evento, id: eventos.length + 1 };
    eventos.push(nuevo);
    this.saveLocalEventos(evento.admin.id, eventos);

    return of(nuevo);
  }

  // -------------------------
  // PRIVATE HELPERS (local)
  // -------------------------

  private isPremium(): boolean {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario?.plan === 'premium';
  }

  private localKey(adminId: number) {
    return `eventos-${adminId}`;
  }

  private loadLocalEventos(adminId: number): Evento[] {
    const raw = localStorage.getItem(this.localKey(adminId));
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocalEventos(adminId: number, eventos: Evento[]) {
    localStorage.setItem(this.localKey(adminId), JSON.stringify(eventos));
  }
}
