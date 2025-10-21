import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as EventoActions from '../../state/evento/evento.actions';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectAllEventos } from '../../state/evento/evento.selectors';
import { Cita, Evento, Servicio } from '../../state/evento/evento.model';
import { AppState } from '../../state/app.state';
import { ServicioSelectorComponent } from './servicio-selector/servicio-selector.component';

@Component({
  selector: 'app-today-select-apartar',
  standalone: true,
  imports: [CommonModule, ServicioSelectorComponent],
  templateUrl: './today-select-apartar.component.html',
  styleUrls: ['./today-select-apartar.component.scss']
})
export class TodaySelectApartarComponent implements OnInit {
  evento$!: Observable<Evento | undefined>;
  evento?: Evento;

  diasVisibles: Date[] = [];
  indiceBase = 0;
  servicioSeleccionado?: Servicio;
  horasDisponibles: { [fecha: string]: { label: string; ocupada: boolean; }[] } = {};
horaSeleccionada: any;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.evento$ = this.store.select(selectAllEventos).pipe(map(evs => evs[0]));
    this.evento$.subscribe(ev => {
      this.evento = ev;
      this.generarDias();
      this.generarHoras();
    });
  }

  generarDias() {
    const hoy = new Date();
    this.diasVisibles = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + this.indiceBase + i);
      return d;
    });
  }

getEtiquetaDia(d: Date): string {
  const hoy = new Date();
  const mañana = new Date();
  mañana.setDate(hoy.getDate() + 1);

  const soloFecha = (x: Date) => x.toISOString().substring(0,10);

  if (soloFecha(d) === soloFecha(hoy)) return 'Hoy';
  if (soloFecha(d) === soloFecha(mañana)) return 'Mañana';
  return d.toLocaleDateString('es-MX', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase());
}

generarHoras() {
  this.horasDisponibles = {};
  const duracion = this.servicioSeleccionado?.duracionMin ?? 30;
  const citas = this.evento?.citas ?? [];

  for (const d of this.diasVisibles) {
    const diaSemana = d.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
    const disponibilidad = this.evento?.admin?.disponibilidades
      ?.find(disp => disp.dia_semana.toLowerCase() === diaSemana);

    const key = d.toISOString().substring(0, 10);
    const horas: { label: string; ocupada: boolean }[] = [];

    if (!disponibilidad) {
      this.horasDisponibles[key] = [];
      continue;
    }

    const horaInicio = parseInt(disponibilidad.hora_inicio.split(':')[0], 10);
    const horaFin = parseInt(disponibilidad.hora_fin.split(':')[0], 10);

    for (let i = horaInicio * 60; i <= horaFin * 60 - duracion; i += duracion) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const horaInicioSlot = new Date(`${key}T${label}:00`);
      const horaFinSlot = new Date(horaInicioSlot.getTime() + duracion * 60000);

      const ocupada = citas.some(cita => {
        if (!cita.fecha.startsWith(key)) return false;
        const inicioCita = new Date(`${key}T${cita.hora}`);
        const finCita = new Date(inicioCita.getTime() + (cita.servicio?.duracionMin ?? 30) * 60000);
        return horaInicioSlot < finCita && horaFinSlot > inicioCita;
      });

      horas.push({ label, ocupada });
    }

    this.horasDisponibles[key] = horas;
  }
}



  seleccionarServicio(servicio: Servicio | null) {
  this.servicioSeleccionado = servicio || undefined;
    this.generarHoras();
  }

  siguiente() {
    this.indiceBase += 3;
    this.generarDias();
    this.generarHoras();
  }

  anterior() {
    if (this.indiceBase > 0) {
      this.indiceBase -= 3;
      this.generarDias();
      this.generarHoras();
    }
  }

  reservar(fecha: Date, hora: string) {
    if (!this.servicioSeleccionado) {
      alert('Selecciona un servicio primero.');
      return;
    }

    const cita: Cita = {
      id: 0,
      eventoId: this.evento?.id || 0,
      servicioId: this.servicioSeleccionado.id,
      nombreCliente: 'Cliente prueba',
      telefonoCliente: '0000000000',
      fecha: fecha.toISOString().substring(0, 10),
      hora: hora,
      estado: 'pendiente',
      servicio: this.servicioSeleccionado
    };

    this.store.dispatch(
      EventoActions.addCita({
        empresaId: 1,
        eventoId: this.evento?.id || 0,
        cita
      })
    );

    const msg = `✅ Nueva cita creada
💅 Servicio: ${this.servicioSeleccionado.nombre}
📅 Fecha: ${cita.fecha}
🕒 Hora: ${cita.hora}`;

    const adminPhone = this.evento?.admin?.telefono || '6141225524';
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  cancelar() {
    alert('Cita cancelada');
  }
}
