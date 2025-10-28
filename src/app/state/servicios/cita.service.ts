import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import * as EventoActions from '../evento/evento.actions';
import { Cita, Evento, Servicio } from '../evento/evento.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  constructor(private store: Store<AppState>) {}

  generarDias(indiceBase: number): Date[] {
    const hoy = new Date();
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + indiceBase + i);
      return d;
    });
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
  if (!cita.fecha.startsWith(key)) return false;
  const inicioCita = new Date(`${key}T${cita.hora}`);

  // 👇 Agrega este log aquí
  console.log('📋 Verificando cita:', {
    citaId: cita.id,
    servicioId: cita.servicioId,
    citaServicio: cita.servicio,
    serviciosEvento: evento?.servicios
  });

  // duración real de la cita según su servicio
  const duracionCita =
    cita.servicio?.duracionMin ??
    evento?.servicios?.find(s => s.id === cita.servicioId)?.duracionMin ??
    30;

  const finCita = new Date(inicioCita.getTime() + duracionCita * 60000);
  const seCruza = horaInicioSlot < finCita && horaFinSlot > inicioCita;

  console.log('🕒 Comparando slot:', {
    fecha: key,
    slotInicio: horaInicioSlot.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    slotFin: horaFinSlot.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    citaHora: cita.hora,
    duracionCita,
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
    const cita: Cita = {
      id: 0,
      eventoId: evento.id,
      servicioId: servicio.id,
      nombreCliente: 'Cliente prueba',
      telefonoCliente: '0000000000',
      fecha: fecha.toISOString().substring(0, 10),
      hora,
      estado: 'pendiente',
      servicio
    };

    this.store.dispatch(
      EventoActions.addCita({
        empresaId: 1,
        eventoId: evento.id,
        cita
      })
    );

    const msg = `✅ Nueva cita creada
💅 Servicio: ${servicio.nombre}
📅 Fecha: ${cita.fecha}
🕒 Hora: ${cita.hora}`;

    const adminPhone = evento?.admin?.telefono || '6141225524';
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
