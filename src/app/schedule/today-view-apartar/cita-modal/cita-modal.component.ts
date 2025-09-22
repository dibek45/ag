import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cita-modal2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cita-modal.component.html',
  styleUrls: ['./cita-modal.component.scss'],
})
export class ModalCitaComponent {
  @Input() servicios: any[] = []; // evento.admin.servicios
  @Input() fechaSeleccionada!: { fecha: Date; hora?: string };
  @Input() citasOcupadas: { fecha: string; hora: string; duracionMin?: number }[] = [];
  @Input() eventoId!: number; // 👈 pásalo desde el padre
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveModal = new EventEmitter<any>(); // emitimos la cita lista

  form!: FormGroup;
  tabActivo = 0;
  horasDisponibles: string[] = [];
  horaFin = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombreCliente: ['', [Validators.required, Validators.minLength(2)]],
      telefonoCliente: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fecha: ['', [Validators.required]],    // yyyy-mm-dd
      hora: ['', [Validators.required]],     // "h:mmam/pm"
      servicioId: [null, [Validators.required]],
      estado: ['pendiente'],
      eventoId: [null, [Validators.required]], // se setea en ngOnChanges
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // set eventoId
    if (this.eventoId && this.form) {
      this.form.get('eventoId')?.setValue(this.eventoId);
    }

    // set fecha/hora a partir de fechaSeleccionada
    if (this.fechaSeleccionada?.fecha) {
      const yyyy = this.fechaSeleccionada.fecha.getFullYear();
      const mm = String(this.fechaSeleccionada.fecha.getMonth() + 1).padStart(2,'0');
      const dd = String(this.fechaSeleccionada.fecha.getDate()).padStart(2,'0');
      const fechaStr = `${yyyy}-${mm}-${dd}`;
      this.form.get('fecha')?.setValue(fechaStr);

      if (this.fechaSeleccionada.hora) {
        this.form.get('hora')?.setValue(this.fechaSeleccionada.hora);
      }
    }

    // set servicioId según tab activo
    if (this.servicios?.length) {
      const sid = this.servicios[this.tabActivo]?.id ?? null;
      this.form.get('servicioId')?.setValue(sid);
      // recalcula horas
      this.calcularHorasDisponibles();
      // si ya hay hora, actualiza horaFin
      this.actualizarHoraFin();
    }
  }

  cambiarTab(i: number) {
    this.tabActivo = i;
    const sid = this.servicios[i]?.id ?? null;
    this.form.get('servicioId')?.setValue(sid);
    this.calcularHorasDisponibles();
    this.actualizarHoraFin();
  }

  // ==== Guardar ====
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    // normaliza hora (si tu backend espera "HH:mm:ss", conviértelo aquí si lo necesitas)
    // Ejemplo: convertir "2:30pm" -> "14:30:00"
    const to24h = (ampm: string) => {
      const m = ampm.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
      if (!m) return ampm; // por si ya viene formateado
      let h = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const suf = m[3].toLowerCase();
      if (suf === 'pm' && h !== 12) h += 12;
      if (suf === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
    };

    const cita = {
      nombreCliente: payload.nombreCliente.trim(),
      telefonoCliente: payload.telefonoCliente,
      fecha: payload.fecha,           // "YYYY-MM-DD"
      hora: to24h(payload.hora),      // "HH:mm:ss"
      estado: payload.estado,
      eventoId: payload.eventoId,
      servicioId: payload.servicioId,
    };

    this.saveModal.emit(cita); // el padre hará el dispatch
  }

  // ==== Disponibilidad y hora fin ====
  calcularHorasDisponibles() {
    if (!this.servicios.length || !this.fechaSeleccionada?.fecha) return;

    const servicio = this.servicios[this.tabActivo];
    const duracionServicio = servicio?.duracionMin || 30;

    // intervalo base: menor duración de todos
    const menorDuracion = Math.min(...this.servicios.map(s => s.duracionMin || 30));
    const intervalo = menorDuracion > 0 ? menorDuracion : 30;

    const apertura = 10;
    const cierre = 18;
    const yyyy = this.fechaSeleccionada.fecha.getFullYear();
    const mm = String(this.fechaSeleccionada.fecha.getMonth() + 1).padStart(2,'0');
    const dd = String(this.fechaSeleccionada.fecha.getDate()).padStart(2,'0');
    const diaStr = `${yyyy}-${mm}-${dd}`;

    const horas: string[] = [];

    for (let h = apertura; h < cierre; h++) {
      for (let m = 0; m < 60; m += intervalo) {
        const inicioSlot = new Date(this.fechaSeleccionada.fecha);
        inicioSlot.setHours(h, m, 0, 0);

        const finSlot = new Date(inicioSlot.getTime() + duracionServicio * 60000);

        const cierreTime = new Date(this.fechaSeleccionada.fecha);
        cierreTime.setHours(cierre, 0, 0, 0);
        if (finSlot.getTime() > cierreTime.getTime()) continue;

        // cruces
        const solapada = this.citasOcupadas.some(c => {
          if (c.fecha !== diaStr) return false;
          const [ch, cm] = c.hora.split(':').map(Number);
          const inicioCita = new Date(this.fechaSeleccionada.fecha);
          inicioCita.setHours(ch, cm, 0, 0);
          const durCita = c.duracionMin ?? 60;
          const finCita = new Date(inicioCita.getTime() + durCita * 60000);
          return (inicioSlot < finCita && finSlot > inicioCita);
        });

        if (!solapada) horas.push(this.formatAmPm(inicioSlot));
      }
    }

    this.horasDisponibles = horas;
  }

  actualizarHoraFin() {
    const ampm = this.form.get('hora')?.value;
    if (!ampm) { this.horaFin = ''; return; }

    const duracion = this.servicios[this.tabActivo]?.duracionMin || 30;
    const m = ampm.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!m) { this.horaFin = ''; return; }

    let h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const suf = m[3].toLowerCase();
    if (suf === 'pm' && h !== 12) h += 12;
    if (suf === 'am' && h === 12) h = 0;

    const inicio = new Date(this.fechaSeleccionada.fecha);
    inicio.setHours(h, mm, 0, 0);

    const fin = new Date(inicio.getTime() + duracion * 60000);
    this.horaFin = this.formatAmPm(fin);
  }

  // utils
  private formatAmPm(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12; hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
    return `${hours}:${minutesStr}${ampm}`;
  }
}
