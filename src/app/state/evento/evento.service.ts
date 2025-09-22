import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Cita, Evento } from './evento.model';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private baseUrl = 'https://api.sorteos.sa.dibeksolutions.com';

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todos los eventos de un admin
getEventosByAdmin(adminId: number | string): Observable<Evento[]> {
  const id = Number(adminId); // 👈 conversión segura
  const url = `${this.baseUrl}/eventos/admin/${id}`;
  console.log(`📡 Cargando eventos del admin ${id} → ${url}`);
  
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
    return this.http.post<Evento>(`${this.baseUrl}/eventos`, evento);
  }

  // 🔹 Actualizar un evento
  updateEvento(id: number, evento: Partial<Evento>): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseUrl}/eventos/${id}`, evento);
  }

  // 🔹 Eliminar un evento
  deleteEvento(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eventos/${id}`);
  }

  // 🔹 Crear una cita en el backend
  createCita(cita: Partial<Cita>): Observable<Cita> {
    const url = `${this.baseUrl}/citas`;
    return this.http.post<Cita>(url, cita).pipe(
      tap((resp) => console.log('✅ Cita creada en backend:', resp)),
      catchError((error) => {
        console.error('❌ Error al crear cita:', error);
        return of(error);
      })
    );
  }
}
