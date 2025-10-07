import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Evento } from '../../state/evento/evento.model';
import { selectAllEventos, selectEventosByEmpresaId } from '../../state/evento/evento.selectors';
import { ModalCitaComponent } from './cita-modal/cita-modal.component';
import * as EventoActions from '../../state/evento/evento.actions';
import { AppState } from '../../state/app.state';

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
  selected?: boolean;
  cita?: Cita;
}

@Component({
  selector: 'app-today-view-apartar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCitaComponent],
  templateUrl: './today-view-apartar.component.html',
  styleUrls: ['./today-view-apartar.component.scss']
})
export class TodayViewApartarComponent implements OnInit, OnChanges {
  @Input() inputDate!: Date;
  evento?: Evento;
  citasOcupadas: { fecha: string, hora: string }[] = []; // 👈 NUEVA propiedad

  // cada fila representa 30 minutos
  slotUnit = 30;
  slotHeight = 30; 

  date!: string;
  diaSemana = '';
  ownerWhatsApp = '4461796235';

  evento$!: Observable<Evento | undefined>;
  eventoSub?: Subscription;

  citasDelDia: Cita[] = [];
  timeSlots: TimeSlot[] = [];
  hasAvailableSlots = false;

  showModal = false;
  selectedTime: string | null = null;
  clientName = '';
  clientPhone = '';

  // columna izquierda (horas)
  hourLabels: string[] = [];
  startHour = 10; 

  diasSemana: string[] = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  currentDate: Date = new Date();

  slotSeleccionado: { fecha: Date; hora?: string } | null = null;

  constructor(
  private router: Router,
  private route: ActivatedRoute,
  private store: Store<AppState>
  ) {}
ngOnInit(): void {
  // 📅 Leer la fecha del parámetro o usar la actual
  const param = this.route.snapshot.paramMap.get('date');
  if (param) {
    this.date = param;
    this.currentDate = new Date(`${this.date}T00:00:00`);
  } else {
    const t = new Date();
    this.date = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    this.currentDate = t;
  }

  this.setDiaSemana(this.currentDate);

  // 🔍 Buscar adminId subiendo la jerarquía de rutas
  let parentRoute = this.route;
  let empresaId: number | null = null;
  while (parentRoute) {
    const id = parentRoute.snapshot.paramMap.get('adminId');
    if (id) {
      empresaId = Number(id);
      break;
    }
    parentRoute = parentRoute.parent!;
  }

  if (!empresaId) {
    console.error('❌ No se encontró adminId en la ruta');
    return;
  }

  // 🧠 Obtener evento del store
  this.evento$ = this.store.select(selectEventosByEmpresaId(empresaId)).pipe(
    map(eventos => (eventos.length > 0 ? eventos[0] : undefined))
  );

  // 🔁 Suscribirse al evento (solo el primero)
  this.eventoSub = this.evento$.subscribe(ev => {
    if (ev) {
      this.loadCitasAndSlots(ev);
    } else {
      console.info(`📅 Mostrando disponibilidad sin eventos asignados (${this.date})`);
      this.citasDelDia = [];
      this.timeSlots = [];
    }
  });
}



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputDate'] && this.inputDate) {
      const d = new Date(this.inputDate);
      this.date = d.toISOString().split('T')[0];
      this.currentDate = d;
      this.setDiaSemana(d);

      this.evento$?.subscribe(ev => {
        if (ev) this.loadCitasAndSlots(ev);
      }).unsubscribe();
    }
  }


  getFechaHora(cita: Cita): Date {
  return new Date(`${cita.fecha.split('T')[0]}T${cita.hora}`);
}
  // helpers
  private setDiaSemana(date: Date) {
    const raw = this.diasSemana[date.getDay()];
    this.diaSemana = this.normalize(raw);
  }

  private normalize(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private buildHourLabels(horaInicio: string, horaFin: string) {
    const startH = parseInt(horaInicio.slice(0, 2), 10);
    const endH = parseInt(horaFin.slice(0, 2), 10);

    this.startHour = startH;
    this.hourLabels = [];

    for (let h = startH; h < endH; h++) {
      this.hourLabels.push(`${h.toString().padStart(2, '0')}:00`);
      this.hourLabels.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  // altura dinámica de la columna derecha
  get slotsHeight(): string {
    return `${this.hourLabels.length * this.slotHeight}px`;
  }

 

  // UI helpers
  getTop(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    const totalMinutes = (h - this.startHour) * 60 + m;
    return (totalMinutes / this.slotUnit) * this.slotHeight;
  }

  getHeight(duracionMin: number = 30): number {
    return (duracionMin / this.slotUnit) * this.slotHeight;
  }

  isCurrentHour(h: string): boolean {
    const current = new Date().getHours();
    const hourNum = parseInt(h.split(':')[0], 10);
    return hourNum === current;
  }

  selectSlot(slot: TimeSlot) {
    if (!slot.available) return;
    this.timeSlots.forEach(s => (s.selected = false));
    slot.selected = true;
    this.selectedTime = slot.time;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.clientName = '';
    this.clientPhone = '';
  }

  confirmBooking() {
    if (!this.clientName.trim() || !this.clientPhone.trim()) {
      alert('⚠️ Ingresa nombre y teléfono');
      return;
    }
    const phoneDigits = this.clientPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('⚠️ El número de teléfono debe tener 10 dígitos');
      return;
    }

    const msg =
`✅ Nueva cita apartada
👤 Cliente: ${this.clientName}
📞 Tel: ${this.clientPhone}
🕒 Hora: ${this.selectedTime}
📅 Fecha: ${this.date}`;

    const url = `https://wa.me/${this.ownerWhatsApp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    this.closeModal();
  }

  ngOnDestroy() {
    this.eventoSub?.unsubscribe();
  }

  getHoraFin(horaInicio: string, duracionMin: number, fecha: string): string {
const fechaLimpia = fecha.split('T')[0]; // -> "2025-10-02"
const inicio = new Date(`${fechaLimpia}T${horaInicio}`);    inicio.setMinutes(inicio.getMinutes() + duracionMin);
    return inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

abrirModal(hora: string) {
  const [hh, mm] = hora.split(':').map(Number);
  const horaAmPm = new Date(0, 0, 0, hh, mm).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  this.slotSeleccionado = {
    fecha: this.currentDate,
    hora: horaAmPm
  };

  console.log('🕒 Abriendo modal para hora:', horaAmPm);
  this.showModal = true;
}

  cerrarModal() {
    this.showModal = false;
    this.slotSeleccionado = null;
  }

guardarCita(cita: any) {
  console.log("Nueva cita creada:", cita);
  if (this.evento) {
    this.store.dispatch(EventoActions.createCita({ eventoId: this.evento.id, cita }));

    // ✅ Mensaje para WhatsApp
    const msg =
`✅ Nueva cita creada
👤 Cliente: ${cita.nombreCliente}
📞 Tel: ${cita.telefonoCliente}
📅 Fecha: ${cita.fecha}
🕒 Hora: ${cita.hora}`;

    // ⚡ Usar el teléfono del admin
    const adminPhone = this.evento.admin?.telefono || '0'; // fallback
    const url = `https://wa.me/52${adminPhone}?text=${encodeURIComponent(msg)}`;

    // abrir whatsapp en nueva pestaña
    window.open(url, '_blank');
  }

  this.cerrarModal();
}




 get serviciosDisponibles() {
  return this.evento?.servicios ?? [];
}
get citasOcupadasParaModal() {
  const duracionDefault = this.evento?.duracion ?? 60;
  return (this.citasDelDia ?? []).map(c => ({
    fecha: c.fecha,
    hora: c.hora.slice(0, 5), // "HH:mm"
    duracionMin: c.servicio?.duracionMin ?? duracionDefault
  }));
}

get esDiaDescanso(): boolean {
  return !this.hourLabels || this.hourLabels.length === 0;
}


generateSlots(evento: Evento) {
  let horario = evento.admin?.disponibilidades.find(
    d => this.normalize(d.dia_semana) === this.diaSemana
  );

  if (!horario) {
    if (this.citasDelDia.length > 0) {
      const horas = this.citasDelDia.map(c => parseInt(c.hora.split(':')[0], 10));
      const minHora = Math.min(...horas);
      const maxHora = Math.max(...horas) + 1;

      horario = {
        dia_semana: this.diaSemana,
        hora_inicio: `${String(minHora).padStart(2, '0')}:00`,
        hora_fin: `${String(maxHora).padStart(2, '0')}:00`
      } as any;
      console.log("⚡ Usando horario basado en citas:", horario);
    } else {
      this.timeSlots = [];
      this.hourLabels = [];
      this.hasAvailableSlots = false;
      return;
    }
  }

  this.buildHourLabels(horario!.hora_inicio, horario!.hora_fin);

  const start = new Date(`${this.date}T${horario!.hora_inicio}`);
  const end = new Date(`${this.date}T${horario!.hora_fin}`);

  const durationDefault = evento.duracion ?? 60;
  const slots: TimeSlot[] = [];

  for (let t = new Date(start); t < end; t = new Date(t.getTime() + this.slotUnit * 60000)) {
    const label = t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const cita = this.citasDelDia.find(c => {
      const ini = new Date(`${this.date}T${c.hora}`);
      const mins = c.servicio?.duracionMin ?? durationDefault;
      const fin = new Date(ini.getTime() + mins * 60000);
      return t >= ini && t < fin;
    });

    const dur = cita?.servicio?.duracionMin ?? durationDefault;

    slots.push({
      time: label,
      available: !cita,
      cita,
      duration: dur
    });
  }

  this.timeSlots = slots;
  this.hasAvailableSlots = slots.length > 0;
}

private loadCitasAndSlots(evento: Evento) {
  this.evento = evento;

  // 📅 Citas filtradas por fecha
  this.citasDelDia = evento.citas?.filter(c => c.fecha.startsWith(this.date)) || [];

  console.log("📅 Citas para", this.date, this.citasDelDia);

  // 🕒 Si no hay citas, igual genera slots según disponibilidad
  if (!evento.admin?.disponibilidades?.length) {
    console.warn("⚠️ El admin no tiene disponibilidades configuradas");
    this.timeSlots = [];
    this.hasAvailableSlots = false;
    return;
  }

  // 🔹 Generar los slots disponibles del día
  this.generateSlots(evento);

  // ✅ Activar la bandera
  this.hasAvailableSlots = this.timeSlots.some(s => s.available);
}


}
