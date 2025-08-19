import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Evento } from '../../state/evento/evento.model';
import { selectAllEventos } from '../../state/evento/evento.selectors';

interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
  cita?: Cita;
}

@Component({
  selector: 'app-today-view-apartar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './today-view-apartar.component.html',
  styleUrls: ['./today-view-apartar.component.scss']
})
export class TodayViewApartarComponent implements OnInit, OnChanges {
  @Input() inputDate!: Date;   // 👈 ahora sí se usa

  date!: string;
  diaSemana: string = '';
  ownerWhatsApp: string = '4461796235';

  evento$!: Observable<Evento | undefined>;
  citasDelDia: Cita[] = [];
  timeSlots: TimeSlot[] = [];
  hasAvailableSlots = false;

  showModal = false;
  selectedTime: string | null = null;
  clientName: string = '';
  clientPhone: string = '';

  diasSemana: string[] = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  selectedDay!: Date;        // 👈 aquí declaras la propiedad

  constructor(
    private route: ActivatedRoute,
    private store: Store
  ) {}

ngOnInit(): void {
  // 🔹 fallback si no viene inputDate (por ruta directa)
  const param = this.route.snapshot.paramMap.get('date');
if (param) {
  this.date = param;
} else {
  const today = new Date();
  this.date = today.getFullYear() +
    '-' + String(today.getMonth() + 1).padStart(2, '0') +
    '-' + String(today.getDate()).padStart(2, '0');
}
  // 🔹 fuerza a medianoche para evitar desfases por zona horaria
  const initialDate = new Date(this.date + 'T00:00:00');
  this.selectedDay = initialDate;

  // mostrar día de la semana al inicio
  this.setDiaSemana(initialDate);

  // 🔹 obtenemos el evento del store
  this.evento$ = this.store.select(selectAllEventos).pipe(
    map(eventos => (eventos.length > 0 ? eventos[0] : undefined))
  );

  // 🔹 nos suscribimos y cargamos citas+slots
  this.evento$.subscribe(evento => {
    if (evento) {
      this.loadCitasAndSlots(evento);

      // asegurar que el día se actualice también cuando cambia la fecha
      this.setDiaSemana(this.selectedDay);
    }
  });
}

  // 🔹 se dispara cuando cambia inputDate (desde week-view)
ngOnChanges(changes: SimpleChanges): void {
  if (changes['inputDate'] && this.inputDate) {
    // usar la fecha que viene del padre
    this.selectedDay = new Date(this.inputDate); 
    this.date = this.selectedDay.toISOString().split('T')[0]; 

    // recalcular el día de la semana
    this.setDiaSemana(this.selectedDay);

    this.evento$?.subscribe(evento => {
      if (evento) {
        this.loadCitasAndSlots(evento);
      }
    });
  }
}



private setDiaSemana(date: Date) {
  this.diaSemana = this.diasSemana[date.getDay()];
}

  private loadCitasAndSlots(evento: Evento) {
    this.citasDelDia = evento.citas.filter(c => c.fecha.startsWith(this.date));
    this.generateSlots(evento);
  }

  generateSlots(evento: Evento) {
    console.log("🟢 generateSlots ejecutado con fecha:", this.date);

    const horario = evento.admin?.disponibilidades.find(
      d => d.dia_semana.toLowerCase() === this.diaSemana
    );

    if (!horario) {
      console.warn("❌ Día cerrado");
      this.timeSlots = [];
      this.hasAvailableSlots = false;
      return;
    }

    const slotDurationMinutes = evento.duracion ?? 60;
    const start = new Date(`${this.date}T${horario.hora_inicio}`);
    const end = new Date(`${this.date}T${horario.hora_fin}`);

    const slots: TimeSlot[] = [];

    for (
      let slotDate = new Date(start);
      slotDate < end;
      slotDate = new Date(slotDate.getTime() + slotDurationMinutes * 60000)
    ) {
      const timeLabel = slotDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const cita = this.citasDelDia.find(c => {
        const ini = new Date(`${this.date}T${c.hora}`);
        const fin = new Date(ini.getTime() + slotDurationMinutes * 60000);
        return slotDate >= ini && slotDate < fin;
      });

      slots.push({
        time: timeLabel,
        available: !cita,
        cita,
      });
    }

    this.timeSlots = slots;
    this.hasAvailableSlots = this.timeSlots.some(slot => slot.available);

    console.log("✅ Slots finales:", this.timeSlots);
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

    const message = `✅ Nueva cita apartada
👤 Cliente: ${this.clientName}
📞 Tel: ${this.clientPhone}
🕒 Hora: ${this.selectedTime}
📅 Fecha: ${this.date}`;

    const url = `https://wa.me/${this.ownerWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    this.closeModal();
  }
}
