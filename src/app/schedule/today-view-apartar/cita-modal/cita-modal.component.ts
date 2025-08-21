import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cita-modal',
  imports:[FormsModule, CommonModule],
  standalone:true,
  templateUrl: './cita-modal.component.html',
  styleUrls: ['./cita-modal.component.scss'],
})
export class ModalCitaComponent {
  @Input() servicios: any[] = []; // viene de evento.admin.servicios
  @Input() fechaSeleccionada!: { fecha: Date; hora?: string };
  @Input() citasOcupadas: { fecha: string; hora: string; duracionMin?: number }[] = [];
  @Output() closeModal = new EventEmitter<void>();

  titulo = '';
  tabActivo = 0;  
  horasDisponibles: string[] = [];
  fechaStr: string = ''; // para el input type="date"
  horaFin: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fechaSeleccionada'] || changes['citasOcupadas'] || changes['servicios']) {
      if (this.fechaSeleccionada?.fecha) {
        this.fechaStr = this.toLocalDateStr(this.fechaSeleccionada.fecha);
      }
      this.calcularHorasDisponibles();
    }
  }

  private toLocalDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
  }

  private parseLocalDate(str: string): Date {
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, (m - 1), d, 0, 0, 0, 0);
  }

  cambiarFecha(fechaStr: string) {
    this.fechaStr = fechaStr;
    this.fechaSeleccionada.fecha = this.parseLocalDate(fechaStr);
    this.calcularHorasDisponibles();
  }

  cambiarTab(index: number) {
    this.tabActivo = index;
    this.calcularHorasDisponibles();
  }

  guardar() {
    console.log('Cita guardada:', {
      servicio: this.servicios[this.tabActivo],
      titulo: this.titulo,
      fecha: {
        fecha: this.toLocalDateStr(this.fechaSeleccionada.fecha),
        hora: this.fechaSeleccionada.hora
      }
    });
    this.closeModal.emit();
  }

calcularHorasDisponibles() {
  if (!this.servicios.length || !this.fechaSeleccionada) return;

  const servicio = this.servicios[this.tabActivo];
  const duracionServicio = servicio?.duracionMin || 30;

// 🔹 Encuentra la menor duración de todos los servicios
const menorDuracion = Math.min(...this.servicios.map(s => s.duracionMin));

// 🔹 Usa la menor duración como intervalo base
const intervalo = menorDuracion > 0 ? menorDuracion : 30;

  const apertura = 10;
  const cierre = 18;
  const diaStr = this.toLocalDateStr(this.fechaSeleccionada.fecha);

  const horas: string[] = [];

  console.log("📅 Día seleccionado:", diaStr);
  console.log("📌 Todas las citas ocupadas recibidas:", this.citasOcupadas);

  for (let h = apertura; h < cierre; h++) {
    for (let m = 0; m < 60; m += intervalo) {
      const inicioSlot = new Date(this.fechaSeleccionada.fecha);
      inicioSlot.setHours(h, m, 0, 0);

      const finSlot = new Date(inicioSlot.getTime() + duracionServicio * 60000);

      // límite del día
      const cierreTime = new Date(this.fechaSeleccionada.fecha);
      cierreTime.setHours(cierre, 0, 0, 0);

      if (finSlot.getTime() > cierreTime.getTime()) continue;

      // 🔎 Verificar solapamiento con cada cita ocupada
      const solapada = this.citasOcupadas.some(c => {
        if (c.fecha !== diaStr) return false;

        const [ch, cm] = c.hora.split(':').map(Number);
        const inicioCita = new Date(this.fechaSeleccionada.fecha);
        inicioCita.setHours(ch, cm, 0, 0);

        const duracionCita = c.duracionMin ?? 60;
        const finCita = new Date(inicioCita.getTime() + duracionCita * 60000);

        // 🚫 Caso: cualquier cruce parcial o total
        return (
          inicioSlot < finCita && finSlot > inicioCita
        );
      });

      if (!solapada) {
        horas.push(this.formatTime(inicioSlot));
      } else {
        console.log("❌ Slot bloqueado:", this.formatTime(inicioSlot));
      }
    }
  }

  console.log("✅ Horas disponibles finales:", horas);
  this.horasDisponibles = horas;
}
actualizarHoraFin() {
  if (!this.fechaSeleccionada?.hora) return;

  const duracion = this.servicios[this.tabActivo]?.duracionMin || 30;

  // "2:30pm" -> [, "2", "30", "pm"]
  const m = this.fechaSeleccionada.hora.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!m) return;
  let h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const suf = m[3].toLowerCase();

  // a 24h
  if (suf === 'pm' && h !== 12) h += 12;
  if (suf === 'am' && h === 12) h = 0;

  // usar la fecha seleccionada (no new Date() a secas)
  const inicio = new Date(this.fechaSeleccionada.fecha);
  inicio.setHours(h, mm, 0, 0);

  const fin = new Date(inicio.getTime() + duracion * 60000);
  this.horaFin = this.formatTime(fin); // sigue mostrando en 12h con am/pm
}



  private formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr}${ampm}`;
  }
}
