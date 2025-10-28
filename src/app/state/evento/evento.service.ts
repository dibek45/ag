import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Evento, Cita } from './evento.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = environment.apiUrl; // 👈 toma la URL según el modo

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todos los eventos de un admin
  getEventosByAdmin(adminId: number): Observable<Evento[]> {
   const query = `
query EventosByAdmin($adminId: Int!) {
  eventosByAdmin(adminId: $adminId) {
    id
    descripcion
    fecha
    titulo
    citas {
      id
      hora
      fecha
      nombreCliente
      servicioId
      servicio {
        id
        nombre
        duracionMin
      }
    }
    duracion
    servicios {
      id
      nombre
      duracionMin
      precioCents
    }
    admin {
      disponibilidades {
        id
        dia_semana
        hora_inicio
        hora_fin
      }
    }
  }
}
`;


    return this.http
      .post<any>(this.apiUrl, { query, variables: { adminId } })
      .pipe(
        map((res) => res.data.eventosByAdmin as Evento[]),
        catchError((error) => {
          console.error('❌ Error al obtener eventos:', error);
          return of([]);
        })
      );
  }

  // 🔹 Crear un evento
  crearEvento(data: Partial<Evento>): Observable<Evento> {
    const mutation = `
      mutation CrearEvento($data: CreateEventoInput!) {
        crearEvento(data: $data) {
          id
          titulo
          descripcion
          fecha
          duracion
        }
      }
    `;
    return this.http.post<any>(this.apiUrl, { query: mutation, variables: { data } })
      .pipe(map((res) => res.data.crearEvento as Evento));
  }

  // 🔹 Actualizar un evento
  actualizarEvento(id: number, data: Partial<Evento>): Observable<Evento> {
    const mutation = `
      mutation ActualizarEvento($id: Int!, $data: UpdateEventoInput!) {
        actualizarEvento(id: $id, data: $data) {
          id
          titulo
          descripcion
          fecha
          duracion
        }
      }
    `;
    return this.http.post<any>(this.apiUrl, { query: mutation, variables: { id, data } })
      .pipe(map((res) => res.data.actualizarEvento as Evento));
  }

  // 🔹 Eliminar un evento
  eliminarEvento(id: number): Observable<boolean> {
    const mutation = `
      mutation EliminarEvento($id: Int!) {
        eliminarEvento(id: $id)
      }
    `;
    return this.http.post<any>(this.apiUrl, { query: mutation, variables: { id } })
      .pipe(map((res) => res.data.eliminarEvento as boolean));
  }

  // 🔹 Crear cita
  crearCita(data: Partial<Cita>): Observable<Cita> {
    const mutation = `
      mutation CrearCita($data: CreateCitaInput!) {
        crearCita(data: $data) {
          id
          nombreCliente
          telefonoCliente
          fecha
          hora
          estado
          servicioId
        }
      }
    `;
    return this.http.post<any>(this.apiUrl, { query: mutation, variables: { data } })
      .pipe(map((res) => res.data.crearCita as Cita));
  }

  // 🔹 Actualizar cita
  actualizarCita(id: number, data: Partial<Cita>): Observable<Cita> {
    const mutation = `
      mutation ActualizarCita($id: Int!, $data: UpdateCitaInput!) {
        actualizarCita(id: $id, data: $data) {
          id
          nombreCliente
          telefonoCliente
          fecha
          hora
          estado
        }
      }
    `;
    return this.http.post<any>(this.apiUrl, { query: mutation, variables: { id, data } })
      .pipe(map((res) => res.data.actualizarCita as Cita));
  }



  eliminarCita(id: number) {
  const mutation = `
    mutation EliminarCita($id: Int!) {
      eliminarCita(id: $id)
    }
  `;

  return this.http.post<any>(this.apiUrl, {
    query: mutation,
    variables: { id }
  })
  .pipe(
    map(res => res.data.eliminarCita as boolean),
    catchError(error => {
      console.error('❌ Error al eliminar cita:', error);
      return of(false);
    })
  );
}
}