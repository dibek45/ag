import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Evento } from '../../state/evento/evento.model'; 
import { selectAllEventos, selectEventosByAdmin } from '../../state/evento/evento.selectors'; 
import * as EventoActions from '../../state/evento/evento.actions'; // 👈 importa tus actions

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports:[DatePipe, CommonModule],
  providers: [DatePipe],
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class MonthViewComponent implements OnInit {
  daysInMonth: (Date | null)[] = [];
  currentMonth: Date = new Date();
  currentDate: Date = new Date();
  currentMonthLabel: string = '';
evento0: Evento | undefined;

  // 🔹 Observables de Redux
  eventos$!: Observable<Evento[]>;
  evento0$!: Observable<Evento | undefined>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) {}

citasByDate: { [date: string]: Cita[] } = {};

ngOnInit() {
  this.updateMonthLabel();
  this.generateCalendar(this.currentMonth);

  const adminId = 1;
  this.store.dispatch(EventoActions.loadEventos({ adminId }));

  this.eventos$ = this.store.select(selectEventosByAdmin(adminId));
  this.evento0$ = this.store.select(selectAllEventos).pipe(
    map(eventos => eventos.length > 0 ? eventos[0] : undefined)
  );

  this.evento0$.subscribe(ev => {
    this.evento0 = ev;
    console.log("🎯 Evento 0:", ev);

    if (ev?.citas) {
      this.citasByDate = ev.citas.reduce((acc, cita) => {
        const dateKey = cita.fecha.split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(cita);
        return acc;
      }, {} as { [date: string]: Cita[] });
    }
  });
}

/** ✅ Devuelve cuántas citas hay en ese día */
getCitasForDay(day: Date | null): Cita[] {
  if (!day) return [];
  const key = day.toISOString().split("T")[0];
  return this.citasByDate[key] || [];
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

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

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
  const sorteoId = this.route.snapshot.paramMap.get('numeroSorteo');

  // Aquí puedes pasar por queryParams la fecha
  this.router.navigate([`/${sorteoId}/agenda/schedule/day`, dateStr], {
    state: { date: dateStr }  // 👈 opcional
  });
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
