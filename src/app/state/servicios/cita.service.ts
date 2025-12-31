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

    private apiUrl = environment.apiUrl;

    constructor(private store: Store<AppState>, private http: HttpClient) {}

    generarDias(indiceBase = 0, evento?: Evento, fechaBase?: Date): Date[] {
      const base = fechaBase || new Date();
      const dias: Date[] = [];

      for (let i = 0; i < 3; i++) {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + indiceBase + i);
        dias.push(d);
      }

      console.log('📆 Días visibles generados:', dias.map(x => x.toLocaleDateString('en-CA')));
      return dias;
    }
    private toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}





   getEtiquetaDia(d: Date): string {
  const hoy = new Date();
  const mañana = new Date();
  mañana.setDate(hoy.getDate() + 1);

  const soloFecha = (x: Date) => this.toLocalDateString(x);

  if (soloFecha(d) === soloFecha(hoy)) return 'Hoy';
  if (soloFecha(d) === soloFecha(mañana)) return 'Mañana';

  return d
    .toLocaleDateString('es-MX', { weekday: 'long' })
    .replace(/^\w/, c => c.toUpperCase());
}


    generarHoras(
  evento: Evento | undefined,
  servicioSeleccionado: Servicio | undefined,
  diasVisibles: Date[]
): Record<string, { label: string; ocupada: boolean; clienteId?: number | null }[]> {

  const horasDisponibles: Record<string, { label: string; ocupada: boolean; clienteId?: number | null }[]> = {};
  const duracion = servicioSeleccionado?.duracionMin ?? 30;
  const citas = evento?.citas ?? [];
  const ahora = new Date();

  for (const d of diasVisibles) {
    const diaSemana = d.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();

    const disponibilidad = evento?.admin?.disponibilidades
      ?.find(disp => disp.dia_semana.toLowerCase() === diaSemana);

    const key = d.toLocaleDateString('en-CA'); // yyyy-mm-dd
    const horas: { label: string; ocupada: boolean; clienteId?: number | null }[] = [];

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
      let clienteId: number | null = null;

      const slotDateTime = new Date(`${key}T${label}:00`);

      // =======================================================
      // BLOQUEAR HORAS PASADAS
      // =======================================================
      if (slotDateTime < ahora) {
        horas.push({
          label,
          ocupada: true,
          clienteId: null
        });
        continue;
      }

      // =======================================================
      // VERIFICAR SI LA HORA ESTÁ OCUPADA POR UNA CITA
      // =======================================================
      const ocupada = citas.some(cita => {
        const citaFecha = (cita.fecha ?? '').split('T')[0];
        if (!citaFecha || citaFecha !== key) 
          return false;

        const inicioCita = new Date(`${citaFecha}T${cita.hora}`);

        const duracionCita =
          cita.servicio?.duracionMin ??
          evento?.servicios?.find(s => s.id === cita.servicioId)?.duracionMin ??
          30;

        const finCita = new Date(inicioCita.getTime() + duracionCita * 60000);

        
        const horaInicioSlot = slotDateTime;
        const horaFinSlot = new Date(slotDateTime.getTime() + duracion * 60000);

        const seCruza = horaInicioSlot < finCita && horaFinSlot > inicioCita;

        if (seCruza) clienteId = cita.clienteId ?? null;
        return seCruza;
      });

      horas.push({ label, ocupada, clienteId });
    }

    horasDisponibles[key] = horas;
  }

  return horasDisponibles;
}


  crearCita(data: Partial<Cita>): Observable<Cita> {
    // ⚡ Limpia cualquier campo no permitido por CreateCitaInput
    const cleanData: any = {
      nombreCliente: data.nombreCliente,
      telefonoCliente: data.telefonoCliente,
      fecha: data.fecha,
      hora: data.hora,
      estado: data.estado,
      eventoId: data.eventoId,
      servicioId: data.servicioId,
      clienteId: data.clienteId ?? null,
    };
  alert("se llama crear cita2");
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
          clienteId
          eventoId
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query: mutation,
      variables: { data: cleanData },
    }).pipe(
      map((res) => {
        console.log('🧩 Respuesta completa GraphQL:', res);
        if (res.errors) {
          console.error('🚨 Backend GraphQL devolvió error:', res.errors);
          throw new Error(JSON.stringify(res.errors[0]));
        }
        return res.data.crearCita as Cita;
      }),
      catchError((err) => {
        console.error('❌ Error GraphQL crearCita:', err);
        throw err;
      })
    );
  }



  actualizarCita(id: number, data: Partial<Cita>): Observable<Cita> {
    const mutation = `
      mutation ActualizarCita($actualizarCitaId: Int!, $data: UpdateCitaInput!) {
        actualizarCita(id: $actualizarCitaId, data: $data) {
          id
          fecha
          hora
          estado
          clienteId
        }
      }
    `;

    const cleanData: any = {
      fecha: data.fecha ?? null,
      hora: data.hora ?? null,
      estado: data.estado ?? 'pendiente',
      clienteId: data.clienteId ?? null,
    };

    return this.http.post<any>(this.apiUrl, {
      query: mutation,
      variables: { actualizarCitaId: id, data: cleanData },
    }).pipe(
      map((res) => {
        if (res.errors) throw new Error(JSON.stringify(res.errors[0]));
        return res.data.actualizarCita as Cita;
      }),
      catchError((err) => {
        console.error('❌ Error al actualizar cita:', err);
        throw err;
      })
    );
  }



    eliminarCita(id: number) {
      const mutation = `
        mutation EliminarCita($id: Int!) {
          eliminarCita(id: $id)
        }
      `;

      return this.http
        .post<any>(this.apiUrl, { query: mutation, variables: { id } })
        .pipe(
          map((res) => res.data.eliminarCita as boolean),
          catchError((error) => {
            console.error('❌ Error al eliminar cita:', error);
            return of(false);
          })
        );
    }


    reagendarCita(
    evento: Evento,
    cita: Cita,
    nuevaFecha: Date,
    nuevaHora: string
  ): void {
    const fechaStr = nuevaFecha.toISOString().substring(0, 10);

    console.log('🔄 Reagendando cita:', {
      citaId: cita.id,
      nuevaFecha: fechaStr,
      nuevaHora,
    });

    this.actualizarCita(cita.id, { fecha: fechaStr, hora: nuevaHora }).subscribe({
      next: (citaActualizada) => {
        console.log('✅ Cita reagendada en backend:', citaActualizada);

        // 🧠 Actualiza el store Redux
        this.store.dispatch(
          EventoActions.updateCita({
            empresaId: 1,
            eventoId: evento.id,
            cita: { ...cita, ...citaActualizada },
          })
        );

        // 🩵 Actualiza visualmente horarios y colores
        console.log('🎨 Cita reagendada y sincronizada con Redux');
      },
      error: (err) => {
        console.error('❌ Error al reagendar cita:', err);
        alert('No se pudo reagendar la cita. Intenta de nuevo.');
      },
    });
  }

  }
