import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cita-modal.component.html',
  styleUrls: ['./cita-modal.component.scss'],
})
export class ModalCitaComponent {
  @Input() servicios: any[] = [];
  @Input() fechaSeleccionada!: { fecha: Date; hora?: string };
  @Input() citasOcupadas: { fecha: string; hora: string; duracionMin?: number }[] = [];
  @Input() eventoId!: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveModal = new EventEmitter<any>();

  form!: FormGroup;
  tabActivo = 0;
  horasDisponibles: string[] = [];
  horaFin = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombreCliente: ['', [Validators.required, Validators.minLength(2)]],
      telefonoCliente: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      servicioId: [null, [Validators.required]],
      estado: ['pendiente'],
      eventoId: [null, [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🟢 ngOnChanges ejecutado');
    console.log('📅 fechaSeleccionada:', this.fechaSeleccionada);
    console.log('🕒 servicios:', this.servicios);

    if (!this.form) {
      console.warn('⚠️ Form aún no inicializado');
      return;
    }

    if (this.eventoId) {
      console.log('✅ eventoId recibido:', this.eventoId);
      this.form.get('eventoId')?.setValue(this.eventoId);
    }

    if (this.fechaSeleccionada?.fecha) {
      const yyyy = this.fechaSeleccionada.fecha.getFullYear();
      const mm = String(this.fechaSeleccionada.fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(this.fechaSeleccionada.fecha.getDate()).padStart(2, '0');
      const fechaStr = `${yyyy}-${mm}-${dd}`;

      this.form.get('fecha')?.setValue(fechaStr);
      console.log('📆 Fecha seteada en form:', fechaStr);

      if (this.fechaSeleccionada.hora) {
        this.form.get('hora')?.setValue(this.fechaSeleccionada.hora);
        console.log('🕐 Hora seteada en form:', this.fechaSeleccionada.hora);
        this.horaFin = '';
        this.actualizarHoraFin();
      }
    }

    if (this.servicios?.length) {
      const sid = this.servicios[this.tabActivo]?.id ?? null;
      this.form.get('servicioId')?.setValue(sid);
      console.log('💅 Servicio activo:', sid);
      this.calcularHorasDisponibles();
    }
  }

  cambiarTab(i: number) {
    this.tabActivo = i;
    const sid = this.servicios[i]?.id ?? null;
    this.form.get('servicioId')?.setValue(sid);
    console.log('🔁 Cambió a tab:', i, '→ servicioId:', sid);
    this.calcularHorasDisponibles();
    this.actualizarHoraFin();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('❌ Form inválido:', this.form.value);
      return;
    }

    const payload = this.form.value;

    const to24h = (ampm: string) => {
      const m = ampm.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
      if (!m) return ampm;
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
      fecha: payload.fecha,
      hora: to24h(payload.hora),
      estado: payload.estado,
      eventoId: payload.eventoId,
      servicioId: payload.servicioId,
    };

    console.log('✅ Cita lista para guardar:', cita);
    this.saveModal.emit(cita);
  }

  calcularHorasDisponibles() {
    if (!this.servicios.length || !this.fechaSeleccionada?.fecha) {
      console.warn('⚠️ No hay servicios o fecha seleccionada');
      return;
    }

    const servicio = this.servicios[this.tabActivo];
    const duracionServicio = servicio?.duracionMin || 30;
    console.log('🧮 Calculando horas para servicio:', servicio.nombre, 'Duración:', duracionServicio);

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
    console.log('🕓 Horas disponibles generadas:', this.horasDisponibles);
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
    console.log(`➡️ ${ampm} → ${this.horaFin}`);
  }

  private formatAmPm(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12; hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
    return `${hours}:${minutesStr}${ampm}`;
  }
}
