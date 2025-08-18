import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-today-view-apartar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './today-view-apartar.component.html',
  styleUrls: ['./today-view-apartar.component.scss']
})
export class TodayViewApartarComponent implements OnInit, OnChanges {
  @Input() inputDate?: Date;

  date!: string;
  ownerWhatsApp: string = '4461796235';

  timeSlots: TimeSlot[] = [
    { time: '9:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '12:30 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:30 PM', available: true },
    { time: '5:00 PM', available: true }
  ];

  showModal = false;
  selectedTime: string | null = null;
  clientName: string = '';
  clientPhone: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Si entra como ruta
    if (!this.inputDate) {
      const param = this.route.snapshot.paramMap.get('date');
      this.date = param ?? 'Hoy';
    } else {
      // Si entra como hijo
      this.date = this.inputDate.toDateString();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputDate'] && this.inputDate) {
      this.date = this.inputDate.toDateString();
      this.selectedTime = null; // reset horario seleccionado
      this.showModal = false;
    }
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
