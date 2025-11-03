import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import * as EventoActions from '../evento/evento.actions';
import { Cita, Evento, Servicio } from '../evento/evento.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

    private apiUrl = environment.apiUrl; // 👈 toma la URL según el modo
  
  constructor(private store: Store<AppState>, private http: HttpClient) {}

 generarDias(indiceBase = 0, evento?: Evento, fechaBase?: Date): Date[] {
  const base = fechaBase || new Date(); // ← usa la fecha seleccionada si existe
  const dias: Date[] = [];

  for (let i = 0; i < 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + indiceBase + i);
    dias.push(d);
  }

  console.log(
    '📆 Días visibles generados desde',
    base.toISOString().split('T')[0],
    '→',
    dias.map(x => x.toISOString().split('T')[0])
  );

  return dias;
}


  getEtiquetaDia(d: Date): string {
    const hoy = new Date();
    const mañana = new Date();
    mañana.setDate(hoy.getDate() + 1);
    const soloFecha = (x: Date) => x.toISOString().substring(0, 10);

    if (soloFecha(d) === soloFecha(hoy)) return 'Hoy';
    if (soloFecha(d) === soloFecha(mañana)) return 'Mañana';
    return d.toLocaleDateString('es-MX', { weekday: 'long' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  generarHoras(
  evento: Evento | undefined,
  servicioSeleccionado: Servicio | undefined,
  diasVisibles: Date[]
): { [fecha: string]: { label: string; ocupada: boolean }[] } {
  const horasDisponibles: { [fecha: string]: { label: string; ocupada: boolean }[] } = {};
  const duracion = servicioSeleccionado?.duracionMin ?? 30;
  const citas = evento?.citas ?? [];

  for (const d of diasVisibles) {
    const diaSemana = d.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
    const disponibilidad = evento?.admin?.disponibilidades
      ?.find(disp => disp.dia_semana.toLowerCase() === diaSemana);

    const key = d.toISOString().substring(0, 10);
    const horas: { label: string; ocupada: boolean }[] = [];

    if (!disponibilidad) {
      horasDisponibles[key] = [];
      continue;
    }

    const horaInicio = parseInt(disponibilidad.hora_inicio.split(':')[0], 10);
    const horaFin = parseInt(disponibilidad.hora_fin.split(':')[0], 10);

    for (let i = horaInicio * 60; i < horaFin * 60; i += duracion) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const horaInicioSlot = new Date(`${key}T${label}:00`);
      const horaFinSlot = new Date(horaInicioSlot.getTime() + duracion * 60000);

     const ocupada = citas.some(cita => {
  const citaFecha = new Date(cita.fecha).toISOString().split('T')[0];

  // 🔍 Log de comparación de fecha
  /*console.log('📆 Comparando fechas:', {
    key,
    citaRaw: cita.fecha,
    citaNormalizada: citaFecha,
    coincide: citaFecha === key
  });*/

  if (citaFecha !== key) return false;

  const inicioCita = new Date(`${key}T${cita.hora}`);

  const duracionCita =
    cita.servicio?.duracionMin ??
    evento?.servicios?.find(s => s.id === cita.servicioId)?.duracionMin ??
    30;

  const finCita = new Date(inicioCita.getTime() + duracionCita * 60000);
  const seCruza = horaInicioSlot < finCita && horaFinSlot > inicioCita;

  console.log('🕒 Comparando slot:', {
    fecha: key,
    citaHora: cita.hora,
    duracionCita,
    slotInicio: horaInicioSlot.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    slotFin: horaFinSlot.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    citaInicio: inicioCita.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    citaFin: finCita.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    resultado: seCruza ? '❌ OCUPADO' : '✅ LIBRE'
  });

  return seCruza;
});


      horas.push({ label, ocupada });
    }

    horasDisponibles[key] = horas;
  }

  return horasDisponibles;
}


reservarCita(evento: Evento, servicio: Servicio, fecha: Date, hora: string): void {
  // 🔹 Recuperar clienteId desde localStorage
  const authData = localStorage.getItem('auth');
  let clienteId: number | null = null;

  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      clienteId = parsed.clienteId ?? null;
    } catch (e) {
      console.warn('⚠️ No se pudo parsear auth localStorage:', e);
    }
  }

  const cita: Cita = {
    id: 0,
    eventoId: evento.id,
    servicioId: servicio.id,
    nombreCliente: 'Cliente prueba',
    telefonoCliente: '0000000000',
    fecha: fecha.toISOString().substring(0, 10),
    hora,
    estado: 'pendiente',
    servicio,
    clienteId: clienteId ?? 0, // 💥 usa el real si existe, si no 0
  };

  // 🔹 1. Enviar la mutación GraphQL
  this.crearCita({
    eventoId: cita.eventoId,
    servicioId: cita.servicioId,
    nombreCliente: cita.nombreCliente,
    telefonoCliente: cita.telefonoCliente,
    fecha: cita.fecha,
    hora: cita.hora,
    estado: cita.estado,
    clienteId: cita.clienteId, // ✅ ahora sí se manda
  }).subscribe({
    next: (nuevaCita) => {
      console.log('✅ Cita creada en backend:', nuevaCita);

      // 🔹 2. Actualizar Redux local
      this.store.dispatch(
        EventoActions.addCita({
          empresaId: 1,
          eventoId: evento.id,
          cita: { ...nuevaCita, servicio },
        })
      );

      // 🔹 3. Notificar por WhatsApp
      const msg = `✅ Nueva cita creada
💅 Servicio: ${servicio.nombre}
📅 Fecha: ${nuevaCita.fecha}
🕒 Hora: ${nuevaCita.hora}`;
      const adminPhone = evento?.admin?.telefono || '6141225524';
      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    },
    error: (err) => {
      console.error('❌ Error al crear cita en backend:', err);
      alert('No se pudo crear la cita. Intenta de nuevo más tarde.');
    },
  });
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
