import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, Evento } from '../../state/evento/evento.model';
import { selectEventosByEmpresaId } from '../../state/evento/evento.selectors';
import * as EventoActions from '../../state/evento/evento.actions';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [DatePipe, CommonModule],
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

  ngOnInit() {
    this.updateMonthLabel();
    this.generateCalendar(this.currentMonth);

    // 🔍 Buscar adminId (que estamos usando como empresaId) en la jerarquía de rutas
    let parentRoute = this.route;
    let empresaId: number | null = null;

    while (parentRoute) {
      const param = parentRoute.snapshot.paramMap.get('adminId'); // 👈 usamos adminId
      if (param) {
        empresaId = Number(param);
        break;
      }
      parentRoute = parentRoute.parent!;
    }

    console.log("📌 MonthView → empresaId (adminId) leído:", empresaId);

    if (empresaId && Number.isFinite(empresaId)) {
      // 🚀 Lanza acción para cargar eventos
      this.store.dispatch(EventoActions.loadEventos({ empresaId }));

      // 📌 Eventos de esa empresa/admin
      this.eventos$ = this.store.select(selectEventosByEmpresaId(empresaId));

      // 📌 Evento 0 filtrado SOLO de esa empresa
      this.evento0$ = this.store.select(selectEventosByEmpresaId(empresaId)).pipe(
        map(eventos => eventos.length > 0 ? eventos[0] : undefined)
      );

      // Suscribirse a evento0 para armar citasByDate
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
        } else {
          this.citasByDate = {}; // limpiar si no hay citas
        }
      });
    }
  }

  goToDay(day: Date) {
    if (!day) return;
    const dateStr = day.toISOString().split('T')[0];

    // 👇 buscar params en la jerarquía de rutas
    let parent = this.route;
    while (parent.parent) {
      parent = parent.parent;
      if (parent.snapshot.paramMap.get('adminId')) break;
    }

    const categoryId = parent.snapshot.paramMap.get('categoryId');
    const companyName = parent.snapshot.paramMap.get('companyName');
    const empresaId = parent.snapshot.paramMap.get('adminId'); // 👈 usamos adminId

    console.log("📌 Navegar a día:", { categoryId, companyName, empresaId, dateStr });

    this.router.navigate([
      `/categoria/${categoryId}/empresa/${companyName}/${empresaId}/agenda/schedule/day/${dateStr}`
    ]);
  }
}
