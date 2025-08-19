import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Evento } from './evento.model';
  import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'https://api.sorteos.sa.dibeksolutions.com/eventos';

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todos los eventos de un admin
getEventosByAdmin(adminId: number): Observable<Evento[]> {
  const url = `${this.apiUrl}/admin/${adminId}`;
  console.log(`📡 Cargando eventos del admin ${adminId} → ${url}`);
  
  return this.http.get<Evento[]>(url).pipe(
    tap((resp) => console.log('✅ Respuesta del backend:', resp)),
    catchError((error) => {
      console.error('❌ Error al obtener eventos:', error);
      return of([]); // devuelve array vacío en caso de fallo
    })
  );
}



  // 🔹 Crear un nuevo evento
  createEvento(evento: Partial<Evento>): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, evento);
  }

  // 🔹 Actualizar un evento
  updateEvento(id: number, evento: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  // 🔹 Eliminar un evento
  deleteEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
