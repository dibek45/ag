import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TodayViewApartarComponent } from '../today-view-apartar/today-view-apartar.component'; // 👈 importa tu componente

interface Event {
  date: Date;
  title: string;
  time: string;
}

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, TodayViewApartarComponent], // 👈 agrégalo aquí
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent {
  currentDate = new Date();
  weekDays: { name: string; date: Date }[] = [];
  selectedDay!: Date;
  selectedEvents: Event[] = [];

  // Eventos de ejemplo
  events: Event[] = [
    { date: new Date(), title: 'Reunión equipo', time: '10:00 AM' },
    { date: new Date(), title: 'Llamada cliente', time: '3:00 PM' },
  ];

  ngOnInit() {
    this.generateWeek();
  }

  generateWeek() {
    const start = this.getStartOfWeek(this.currentDate);
    this.weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        name: date.toLocaleDateString('es-MX', { weekday: 'short' }),
        date: date
      };
    });
  }

  getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  selectDay(date: Date) {
    this.selectedDay = date;
    this.selectedEvents = this.events.filter(
      e => e.date.toDateString() === date.toDateString()
    );
  }

  get currentWeekRange(): string {
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    return `${start.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}`;
  }
}
