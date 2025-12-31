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
import { selectAuthState } from '../../state/auth/auth.selectors';

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

  // ======================================================
  // 👂 1) Reaccionar a LOGIN / LOGOUT desde Redux (clave)
  // ======================================================
  this.store.select(selectAuthState).subscribe(auth => {
    console.log("🔐 Auth cambió:", auth);

    // ------------------------
    // 🟥 LOGOUT
    // ------------------------
if (!auth.isLoggedIn) {
  console.log("🟥 Logout detectado — limpiando UI");

  // 🔥 Limpiar cliente en memoria
  this.clienteIdActual = null;

  // 🔥 Cerrar modales
  this.mostrarConfirmacion = false;
  this.mostrarModalReagendar = false;

  // 🔥 Asegurar que servicio seleccionado NO cause render como logeado
  this.servicioSeleccionado = undefined;

  // 🔄 Recargar días y horas como usuario NO logeado
  if (this.evento) {
    this.diasVisibles = this.citaService.generarDias(
      this.indiceBase,
      this.evento
    );

    // 💥 Pasar undefined (NO null)
    this.horasDisponibles = this.citaService.generarHoras(
      this.evento,
      undefined,
      this.diasVisibles
    );
  }

  // 🧽 Forzar repintado del grid (Angular cambia referencia)
  this.horasDisponibles = { ...this.horasDisponibles };

  return; // ← AHORA SÍ puedes usar return aquí
}



    // ------------------------
    // 🟩 LOGIN
    // ------------------------
    this.cargarClienteId();

    // 🔄 Recargar los días visibles
    if (this.evento) {
      this.diasVisibles = this.citaService.generarDias(
        this.indiceBase,
        this.evento
      );
    }

    // 🔥 Recargar horas aunque NO elijas el servicio otra vez
    if (this.evento && this.servicioSeleccionado) {
      this.horasDisponibles = this.citaService.generarHoras(
        this.evento,
        this.servicioSeleccionado,
        this.diasVisibles
      );
    }
  });


  // ======================================================
  // 👂 2) Cambios en localStorage (otra pestaña)
  // ======================================================
  window.addEventListener('storage', () => this.cargarClienteId());


  // ======================================================
  // 📅 3) Cargar EVENTO desde Redux
  // ======================================================
  this.evento$ = this.store.select(selectAllEventos).pipe(
    map(evs => evs[0])
  );

  this.evento$.subscribe(ev => {
    if (!ev) return;

    console.log('🎯 Evento recibido:', ev);
    this.evento = ev;

    // Generar días visibles
    this.diasVisibles = this.citaService.generarDias(
      this.indiceBase,
      ev
    );

    // Generar las horas disponibles desde el inicio
    this.horasDisponibles = this.citaService.generarHoras(
      ev,
      this.servicioSeleccionado,
      this.diasVisibles
    );
  });


  // ======================================================
  // 📆 4) Cambiar fecha desde la URL
  // ======================================================
  this.route.paramMap.subscribe(params => {
    const dateStr = params.get('date');

    this.fechaSeleccionada = dateStr
      ? new Date(dateStr)
      : new Date();

    if (this.evento && this.fechaSeleccionada) {
      this.diasVisibles = this.citaService.generarDias(
        this.indiceBase,
        this.evento,
        this.fechaSeleccionada
      );

      this.horasDisponibles = this.citaService.generarHoras(
        this.evento,
        this.servicioSeleccionado,
        this.diasVisibles
      );
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
restarUnDia(fecha: Date): Date {
  const f = new Date(fecha);
  f.setDate(f.getDate() - 1);
  return f;
}

reservar(fecha: Date, hora: string) {

  if (!this.validarFechaHora(fecha, hora)) {
    alert("No puedes reservar en un horario que ya pasó.");
    return;
  }

  // Tu lógica normal
  if (!this.evento || !this.servicioSeleccionado) {
    alert('Selecciona un servicio primero.');
    return;
  }

  const duracion = this.servicioSeleccionado.duracionMin ?? 30;

  // Construcción normal de inicio/fin
  const [h, m] = hora.split(':').map(Number);
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m, 0);
  const fin = new Date(inicio.getTime() + duracion * 60000);

  this.fechaSeleccionada = fecha;
  this.horaSeleccionada = hora;
  this.horaFin = fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  this.mostrarConfirmacion = true;
}





validarFechaHora(fechaSlot: Date, hora: string) {
  console.log('--- VALIDACIÓN ---');

  const fechaLocal = this.formatFechaLocal(fechaSlot);

  // Construye fecha correcta sin UTC
  const slot = new Date(`${fechaLocal}T${hora}`);

  const ahora = new Date();

  console.log('Fecha local:', fechaLocal);
  console.log('Slot:', slot);
  console.log('Ahora:', ahora);

  return slot > ahora;
}



confirmarCita() {
  if (!this.evento || !this.servicioSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) return;

  this.mostrarConfirmacion = false;

  const citaParcial = {
    nombreCliente: 'Cliente prueba',
    telefonoCliente: '0000000000',
    fecha: this.fechaSeleccionada.toISOString().substring(0, 10),
    hora: this.horaSeleccionada,
    estado: 'pendiente',
    eventoId: this.evento.id,
    servicioId: this.servicioSeleccionado.id,
    clienteId: this.clienteIdActual ?? null,
  } as any; // el backend rellenará id y demás

  this.store.dispatch(
    EventoActions.addCita({
      empresaId: 1,
      eventoId: this.evento.id,
      cita: citaParcial,
    })
  );
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


private formatFechaLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}


abrirEditarCita(fecha: Date, hora: string, event: MouseEvent) {
  event.stopPropagation(); // evita que dispare reservar()
  console.log('✏️ Editar cita en:', fecha, hora);
  // Aquí puedes abrir un modal o ejecutar la acción de eliminar/modificar
}
getClienteId(fecha: Date, hora: string): number | null {
  if (!this.evento?.citas) return null;

  // 🔹 Solo la parte "YYYY-MM-DD", sin new Date()
  const fechaKey = this.formatFechaLocal(fecha);
  const cita = this.evento.citas.find(c => {
    const citaFecha = c.fecha.split('T')[0]; // evita new Date()
    const horaBase = c.hora.slice(0, 5);
    return citaFecha === fechaKey && horaBase === hora;
  });

  return cita?.clienteId ?? null;
}

esMia(fecha: Date, hora: string): boolean {
  if (!this.evento?.citas) return false;

  // 🔥 Si no hay cliente logueado → jamás puede ser “mía”
  if (this.clienteIdActual === null || this.clienteIdActual === undefined) {
    return false;
  }

  const clienteId = this.clienteIdActual;
  const fechaKey = fecha.toLocaleDateString('en-CA');

  for (const cita of this.evento.citas) {
    if (!cita?.fecha || !cita?.hora) continue;

    const citaFecha = cita.fecha.split('T')[0];
    if (citaFecha !== fechaKey) continue;

    if (cita.clienteId !== clienteId) continue;

    const inicioCita = new Date(`${citaFecha}T${cita.hora}`);
    const duracion = cita.servicio?.duracionMin ?? 30;
    const finCita = new Date(inicioCita.getTime() + duracion * 60000);

    const slotInicio = new Date(`${fechaKey}T${hora}:00`);

    if (slotInicio >= inicioCita && slotInicio < finCita) return true;
  }

  return false;
}







cerrarModal() {
  this.mostrarModalReagendar = false;
}

confirmarReagendar() {
  if (!this.fechaModal || !this.horaModal) return;

  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  const fechaClean = new Date(this.fechaModal);
  fechaClean.setHours(0,0,0,0);

  if (fechaClean < hoy) {
    console.log("⛔ No puedes reagendar a un día pasado");
    return;
  }

  this.reagendar(this.fechaModal, this.horaModal);
  this.mostrarModalReagendar = false;
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
  const ahora = new Date();

  // Normalizar
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  const fechaClean = new Date(fecha);
  fechaClean.setHours(0,0,0,0);

  // 1) 🚫 No permitir abrir modal en días pasados
  if (fechaClean < hoy) {
    console.log("⛔ No se puede abrir modal para citas pasadas (día).");
    return;
  }

  // 2) 🚫 No permitir abrir modal en horas pasadas del MISMO día
  const inicioSlot = new Date(`${fechaClean.toISOString().split("T")[0]}T${hora}`);
  if (fechaClean.getTime() === hoy.getTime() && inicioSlot < ahora) {
    console.log("⛔ No se puede abrir modal para una hora que ya pasó.");
    return;
  }

  // 3) Solo abrir si la cita es del cliente
  if (!this.esMia(fecha, hora)) {
    console.log("⛔ La cita no es tuya. No se abre modal.");
    return;
  }

  // 4) Abrir modal si pasa validaciones
  this.fechaModal = fecha;
  this.horaModal = hora;
  this.mostrarModalReagendar = true;
}



onConfirmarReagendar() {
  // Activa el modo reagendar con parpadeo
  this.modoReagendar = true;
  this.diaSeleccionado = this.formatFechaLocal(this.fechaModal!);
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
