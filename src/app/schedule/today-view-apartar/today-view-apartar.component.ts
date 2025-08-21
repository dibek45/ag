import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Evento } from '../../state/evento/evento.model';
import { selectAllEventos } from '../../state/evento/evento.selectors';
import { ModalCitaComponent } from './cita-modal/cita-modal.component';

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
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {

     this.citasOcupadas = this.citasDelDia.map(c => ({
      fecha: c.fecha,
      hora: c.hora.slice(0, 5)
    }));
    const param = this.route.snapshot.paramMap.get('date');
    if (param) {
      this.date = param;
      this.currentDate = new Date(this.date + 'T00:00:00');
    } else {
      const t = new Date();
      this.date = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
      this.currentDate = t;
    }

    this.setDiaSemana(new Date(this.date + 'T00:00:00'));

    this.evento$ = this.store.select(selectAllEventos).pipe(
      map(list => list.length ? list[0] : undefined)
    );

    this.eventoSub = this.evento$.subscribe(ev => {
      if (ev) this.loadCitasAndSlots(ev);
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

  // core
  generateSlots(evento: Evento) {
    const horario = evento.admin?.disponibilidades.find(
      d => this.normalize(d.dia_semana) === this.diaSemana
    );

    if (!horario) {
      this.timeSlots = [];
      this.hourLabels = [];
      this.hasAvailableSlots = false;
      return;
    }

    this.buildHourLabels(horario.hora_inicio, horario.hora_fin);

    const start = new Date(`${this.date}T${horario.hora_inicio}`);
    const end = new Date(`${this.date}T${horario.hora_fin}`);
    const step = this.slotUnit;

    const durationDefault = evento.duracion ?? 60;
    const slots: TimeSlot[] = [];

    for (let t = new Date(start); t < end; t = new Date(t.getTime() + step * 60000)) {
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
    const inicio = new Date(`${fecha}T${horaInicio}`);
    inicio.setMinutes(inicio.getMinutes() + duracionMin);
    return inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  abrirModal(hora: string) {
    this.slotSeleccionado = {
      fecha: this.currentDate,
      hora: hora
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.slotSeleccionado = null;
  }

  guardarCita(data: any) {
    console.log("Nueva cita creada:", {
      ...data,
      fecha: this.slotSeleccionado?.fecha,
      hora: this.slotSeleccionado?.hora
    });
    this.cerrarModal();
  }

  private loadCitasAndSlots(evento: Evento) {
    this.evento = evento;
    this.citasDelDia = evento.citas.filter(c => c.fecha.startsWith(this.date));
    this.generateSlots(evento);
  }

  get serviciosDisponibles() {
    return this.evento?.admin?.servicios ?? [];
  }
get citasOcupadasParaModal() {
  const duracionDefault = this.evento?.duracion ?? 60;
  return (this.citasDelDia ?? []).map(c => ({
    fecha: c.fecha,
    hora: c.hora.slice(0, 5), // "HH:mm"
    duracionMin: c.servicio?.duracionMin ?? duracionDefault
  }));
}
}
