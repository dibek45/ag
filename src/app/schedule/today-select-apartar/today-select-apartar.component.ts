import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppState } from '../../state/app.state';
import { selectAllEventos } from '../../state/evento/evento.selectors';
import { CitaService } from '../../state/servicios/cita.service';
import { Evento, Servicio } from '../../state/evento/evento.model';
import { ServicioSelectorComponent } from './servicio-selector/servicio-selector.component';
import { ConfirmarCitaModalComponent } from '../../android/features/cambiar-estado-modal/confirmar-cita-modal.component';
import { ActivatedRoute } from '@angular/router';
import * as EventoActions from '../../state/evento/evento.actions';
import { ReagendarCitaModalComponent } from '../../shared/modals/reagendar-cita-modal/reagendar-cita-modal.component';

@Component({
  selector: 'app-today-select-apartar',
  standalone: true,
  imports: [CommonModule, ServicioSelectorComponent, ConfirmarCitaModalComponent,ReagendarCitaModalComponent],
  templateUrl: './today-select-apartar.component.html',
  styleUrls: ['./today-select-apartar.component.scss']
})
export class TodaySelectApartarComponent implements OnInit {
  evento$!: Observable<Evento | undefined>;
  evento?: Evento;
  clienteIdActual: number | null = null;
modoReagendar = false;
diaSeleccionado?: string; // YYYY-MM-DD
mostrarModalReagendar = false;
fechaModal?: Date;
horaModal?: string;

  diasVisibles: Date[] = [];
  indiceBase = 0;
  servicioSeleccionado?: Servicio;
horasDisponibles: {
  [fecha: string]: { label: string; ocupada: boolean; clienteId?: number | null }[];
} = {};
  horaSeleccionada: string = '';
  horaFin: string = '';
  fechaSeleccionada?: Date;

  mostrarConfirmacion = false;

  constructor(
    private store: Store<AppState>,
    public citaService: CitaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.cargarClienteId();
    window.addEventListener('storage', () => this.cargarClienteId());

    this.evento$ = this.store.select(selectAllEventos).pipe(map(evs => evs[0]));

    this.evento$.subscribe(ev => {
      if (!ev) return;

      console.log('🎯 Evento recibido:', ev);
      console.log('📅 Citas cargadas:', ev.citas);

      this.evento = ev;
      this.diasVisibles = this.citaService.generarDias(this.indiceBase, ev);

      if (!ev.citas || ev.citas.length === 0) {
        console.log('⚠️ Evento sin citas, esperando...');
        setTimeout(() => {
          this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
        }, 300);
        return;
      }

      console.log('✅ Citas detectadas:', ev.citas);
      this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
    });

    this.route.paramMap.subscribe(params => {
      const dateStr = params.get('date');
      if (dateStr) {
        this.fechaSeleccionada = new Date(dateStr);
        console.log('📅 Fecha seleccionada desde calendario:', this.fechaSeleccionada);
      } else {
        this.fechaSeleccionada = new Date();
        console.log('📅 Usando fecha de hoy:', this.fechaSeleccionada);
      }

      if (this.evento && this.fechaSeleccionada) {
        this.diasVisibles = this.citaService.generarDias(this.indiceBase, this.evento, this.fechaSeleccionada);
        this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
      }
    });
  }

  seleccionarServicio(servicio: Servicio | null) {
    this.servicioSeleccionado = servicio || undefined;
    if (!this.evento) return;
    this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  }

  siguiente() {
    this.indiceBase += 3;
    this.diasVisibles = this.citaService.generarDias(this.indiceBase, this.evento);
    this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  }

  anterior() {
    if (this.indiceBase > 0) {
      this.indiceBase -= 3;
      this.diasVisibles = this.citaService.generarDias(this.indiceBase);
      this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
    }
  }

  reservar(fecha: Date, hora: string) {
    if (!this.evento || !this.servicioSeleccionado) {
      alert('Selecciona un servicio primero.');
      return;
    }

    const duracion = this.servicioSeleccionado.duracionMin ?? 30;
    const fechaUsar = this.fechaSeleccionada || fecha;
    const inicio = new Date(`${fechaUsar.toISOString().substring(0, 10)}T${hora}`);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    this.fechaSeleccionada = fecha;
    this.horaSeleccionada = hora;
    this.horaFin = fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    this.mostrarConfirmacion = true;
  }
confirmarCita() {
  if (!this.evento || !this.servicioSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) return;
  this.mostrarConfirmacion = false;

  console.log('📤 Enviando clienteIdActual al servicio:', this.clienteIdActual);

  this.citaService.crearCita({
    nombreCliente: 'Cliente prueba',
    telefonoCliente: '0000000000',
    fecha: this.fechaSeleccionada.toISOString().substring(0, 10),
    hora: this.horaSeleccionada,
    estado: 'pendiente',
    eventoId: this.evento.id,
    servicioId: this.servicioSeleccionado.id,
    clienteId: this.clienteIdActual ?? null,
  }).subscribe({
    next: (nuevaCita) => {
      console.log('✅ Cita creada en backend:', nuevaCita);

      // 🧠 Actualiza el store local
      this.store.dispatch(
        EventoActions.addCita({
          empresaId: 1,
          eventoId: this.evento!.id,
          cita: { ...nuevaCita, servicio: this.servicioSeleccionado },
        })
      );

      // 🩵 Recalcula colores en tiempo real
      this.horasDisponibles = this.citaService.generarHoras(
        this.evento!,
        this.servicioSeleccionado,
        this.diasVisibles
      );

      console.log('🔄 Horas recalculadas tras guardar cita');
    },
    error: (err) => {
      console.error('❌ Error al crear cita:', err);
      alert('No se pudo crear la cita. Intenta de nuevo.');
    },
  });
}




  cancelarCita() {
    this.mostrarConfirmacion = false;
  }

  



  // ✅ lee primero clienteId separado y luego de auth si no hay
  private cargarClienteId(): void {
    try {
      const clienteIdStorage = localStorage.getItem('clienteId');
      if (clienteIdStorage) {
        this.clienteIdActual = Number(clienteIdStorage);
        console.log('🧍 Cliente logueado (desde clienteId):', this.clienteIdActual);
        return;
      }

      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        this.clienteIdActual = parsed.clienteId ?? null;
        console.log('🧍 Cliente logueado (desde auth):', this.clienteIdActual);
      } else {
        this.clienteIdActual = null;
      }
    } catch {
      this.clienteIdActual = null;
    }
  }

esCitaDelCliente(fecha: Date, hora: string): boolean {
  if (!this.evento?.citas) return false;

  const fechaKey = fecha.toISOString().substring(0, 10);

  const cita = this.evento.citas.find(c => {
    const citaFecha = c.fecha.split('T')[0]; // ya viene sin hora

    const horaBase = c.hora.slice(0, 5);
    return citaFecha === fechaKey && horaBase === hora;
  });

  const clienteIdCita = cita?.clienteId != null ? Number(cita.clienteId) : null;
  const clienteIdActualNum = this.clienteIdActual != null ? Number(this.clienteIdActual) : null;
  const coincide = clienteIdCita !== null && clienteIdCita === clienteIdActualNum;

  console.log('🧩 Comparando:', { 
    fechaKey, 
    hora, 
    clienteIdCita, 
    clienteIdActual: clienteIdActualNum, 
    coincide 
  });

  return coincide;
}




abrirEditarCita(fecha: Date, hora: string, event: MouseEvent) {
  event.stopPropagation(); // evita que dispare reservar()
  console.log('✏️ Editar cita en:', fecha, hora);
  // Aquí puedes abrir un modal o ejecutar la acción de eliminar/modificar
}
getClienteId(fecha: Date, hora: string): number | null {
  if (!this.evento?.citas) return null;

  // 🔹 Solo la parte "YYYY-MM-DD", sin new Date()
  const fechaKey = fecha.toISOString().split('T')[0];
  const cita = this.evento.citas.find(c => {
    const citaFecha = c.fecha.split('T')[0]; // evita new Date()
    const horaBase = c.hora.slice(0, 5);
    return citaFecha === fechaKey && horaBase === hora;
  });

  return cita?.clienteId ?? null;
}

esMia(fecha: Date, hora: string): boolean {
  if (!this.evento?.citas || !this.clienteIdActual) return false;

  const clienteId = this.clienteIdActual;
  const fechaKey = fecha.toLocaleDateString('en-CA'); // ✅ sin UTC

  for (const cita of this.evento.citas) {
    // 🔒 protección completa ante nulos
    if (!cita || !cita.fecha || !cita.hora) continue;

    const citaFecha = (cita.fecha || '').split('T')[0];
    if (!citaFecha || citaFecha !== fechaKey || cita.clienteId !== clienteId) continue;

    const inicioCita = new Date(`${citaFecha}T${cita.hora}`);
    const duracionCita =
      cita.servicio?.duracionMin ??
      this.evento?.servicios?.find(s => s.id === cita.servicioId)?.duracionMin ??
      30;
    const finCita = new Date(inicioCita.getTime() + duracionCita * 60000);

    const slotInicio = new Date(`${fechaKey}T${hora}:00`);
    const slotFin = new Date(slotInicio.getTime() + 30 * 60000);

    if (slotInicio >= inicioCita && slotInicio < finCita) return true;
  }

  return false;
}






cerrarModal() {
  this.mostrarModalReagendar = false;
}

confirmarReagendar() {
  if (this.fechaModal && this.horaModal) {
    this.reagendar(this.fechaModal, this.horaModal);
    this.mostrarModalReagendar = false;
  }
}

cancelarReagendar() {
  this.modoReagendar = false;
  this.diaSeleccionado = undefined;
}

reagendar(fecha: Date, hora: string) {
  if (!this.evento) return;

  const cita = this.evento.citas.find(c => c.clienteId === this.clienteIdActual);
  if (!cita) return;

  console.log('🔄 Reagendando cita:', cita.id, '→', fecha, hora);

  this.citaService.actualizarCita(cita.id, {
    fecha: fecha.toISOString().substring(0, 10),
    hora,
    clienteId: this.clienteIdActual
  }).subscribe(updated => {
    this.store.dispatch(EventoActions.updateCita({
      empresaId: 1,
      eventoId: this.evento!.id,
      cita: updated
    }));

    // 🎨 Recalcular visualmente
    this.horasDisponibles = this.citaService.generarHoras(
      this.evento!,
      this.servicioSeleccionado,
      this.diasVisibles
    );

    this.modoReagendar = false;
  });
}








abrirModalCita(fecha: Date, hora: string) {
  if (!this.esMia(fecha, hora)) return;

  // Abre el modal visualmente
  this.fechaModal = fecha;
  this.horaModal = hora;
  this.mostrarModalReagendar = true;
}

onConfirmarReagendar() {
  // Activa el modo reagendar con parpadeo
  this.modoReagendar = true;
  this.diaSeleccionado = this.fechaModal?.toISOString().split('T')[0];
  this.mostrarModalReagendar = false;

  // 🟩 Aquí ya entra el modo visual verde/parpadeo
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

onCancelarReagendar() {
  this.mostrarModalReagendar = false;
}

onEliminarCita() {
  alert("Eliminando cita...");
  if (!this.evento || !this.clienteIdActual) return;

  const cita = this.evento.citas.find(c => c.clienteId === this.clienteIdActual);
  if (!cita) return;

  this.mostrarModalReagendar = false;

  this.citaService.eliminarCita(cita.id).subscribe({
    next: () => {
      this.store.dispatch(EventoActions.deleteCita({
        empresaId: 1,
        eventoId: this.evento!.id,
        citaId: cita.id
      }));

      // Recalcular horas
      this.horasDisponibles = this.citaService.generarHoras(
        this.evento!,
        this.servicioSeleccionado,
        this.diasVisibles
      );
    },
    error: () => alert("No se pudo eliminar la cita")
  });
}


}
