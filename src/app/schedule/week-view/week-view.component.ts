import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TodayViewApartarComponent } from '../today-view-apartar/today-view-apartar.component';

interface Event {
  date: Date;
  title: string;
  time: string;
}

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, TodayViewApartarComponent],
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss']
})
export class WeekViewComponent {
  currentDate = new Date(); // will be normalized below
  weekDays: { name: string; date: Date }[] = [];
  selectedDay!: Date;
  selectedEvents: Event[] = [];

  // sample events
  events: Event[] = [
    { date: new Date(), title: 'Reunión equipo', time: '10:00 AM' },
    { date: new Date(), title: 'Llamada cliente', time: '3:00 PM' },
  ];

  ngOnInit() {
    // ✅ normalize currentDate to local midnight
    this.currentDate = this.toLocalMidnight(this.currentDate);

    this.generateWeek();

    // ✅ set initial selected day to today at local midnight
    this.selectedDay = this.toLocalMidnight(new Date());

    // (optional) preload events for today
    this.selectedEvents = this.events.filter(
      e => this.sameLocalDay(e.date, this.selectedDay)
    );
  }

  private toLocalMidnight(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private sameLocalDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  generateWeek() {
    const start = this.getStartOfWeek(this.currentDate);

    this.weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      // ✅ force each cell to local midnight
      const localMidnight = this.toLocalMidnight(date);

      return {
        name: localMidnight.toLocaleDateString('es-MX', { weekday: 'short' }),
        date: localMidnight
      };
    });
  }

  getStartOfWeek(date: Date) {
    const d = this.toLocalMidnight(date); // ✅ normalize first
    const day = d.getDay();               // 0=Sun..6=Sat
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    const start = new Date(d);
    start.setDate(diff);
    return this.toLocalMidnight(start);   // ✅ ensure midnight
  }

  selectDay(date: Date) {
    // ✅ always store a local-midnight clone
    this.selectedDay = this.toLocalMidnight(date);

    this.selectedEvents = this.events.filter(
      e => this.sameLocalDay(e.date, this.selectedDay)
    );
  }

  get currentWeekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    return `${start.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}`;
  }

  prevWeek() {
  // retroceder 7 días desde el inicio de la semana actual
  this.currentDate.setDate(this.currentDate.getDate() - 7);
  this.generateWeek();
  this.selectedDay = this.weekDays[0].date; // opcional: reset al lunes
}

nextWeek() {
  // avanzar 7 días desde el inicio de la semana actual
  this.currentDate.setDate(this.currentDate.getDate() + 7);
  this.generateWeek();
  this.selectedDay = this.weekDays[0].date; // opcional: reset al lunes
}

}
