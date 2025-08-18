import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports:[DatePipe, CommonModule],
    providers: [DatePipe],

  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss'] // si no usas estilos, puedes quitar esta línea
})
export class MonthViewComponent implements OnInit {
  daysInMonth: (Date | null)[] = [];
  currentMonth: Date = new Date();
  currentDate: Date = new Date();
currentMonthLabel: string = '';

  constructor(private router: Router,    private route: ActivatedRoute   // ✅ aquí inyectas ActivatedRoute
) {}

  ngOnInit() {
  this.updateMonthLabel();
  this.generateCalendar(this.currentMonth);
}

updateMonthLabel() {
  this.currentMonthLabel = this.currentDate.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric'
  });
}
  generateCalendar(month: Date) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const days: (Date | null)[] = [];

    // días vacíos antes del inicio del mes
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // días del mes
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), d));
    }

    this.daysInMonth = days;
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  }

  goToDay(day: Date) {
  if (!day) return;
  const dateStr = day.toISOString().split('T')[0];

  // 👇 obtenemos el sorteo desde la URL padre
  const sorteoId = this.route.snapshot.paramMap.get('numeroSorteo');

  console.log('📅 Día clickeado:', dateStr, 'para sorteo:', sorteoId);

  this.router.navigate([`/${sorteoId}/agenda/schedule/day`, dateStr]);
}


prevMonth() {
  this.currentDate = new Date(
    this.currentDate.getFullYear(),
    this.currentDate.getMonth() - 1,
    1
  );
  this.updateMonthLabel();
  this.generateCalendar(this.currentDate);
}

nextMonth() {
  this.currentDate = new Date(
    this.currentDate.getFullYear(),
    this.currentDate.getMonth() + 1,
    1
  );
  this.updateMonthLabel();
  this.generateCalendar(this.currentDate);
}

setToday() {
  this.currentDate = new Date();
  this.updateMonthLabel();
  this.generateCalendar(this.currentDate);
}
}
