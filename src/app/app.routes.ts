import { Routes } from '@angular/router';
import { MetodosPagoComponent } from './pagos/metodos-pago/metodos-pago.component';
import { PreguntasFrecuentesComponent } from './faq/preguntas-frecuentes/preguntas-frecuentes.component';
import { ContactoComponent } from './contacto/contacto/contacto.component';
import { WelcomeComponent } from './android/features/welcome/welcome.component';
import { LoginComponent } from './android/features/login/login.component';
import { MisEventosComponent } from './android/features/main-dashboard/dashboard-home/dashboard-home.component';

// 👇 imports de rifa/evento
import { EventoComponent } from './sorteo/dashboard.sorteo.component';

// 👇 imports para agenda (cliente)
import { ScheduleComponent } from './schedule/schedule.component';
import { MonthViewComponent } from './schedule/month-view/month-view.component';
import { WeekViewComponent } from './schedule/week-view/week-view.component';
import { TodayViewApartarComponent } from './schedule/today-view-apartar/today-view-apartar.component';
import { ContenedorAgendaComponent } from './contenedor-agenda/contenedor-agenda.component';
import { BuscarCitaComponent } from './buscar-cita/buscar-cita.component';

// 👇 imports para agenda-admin
import { EventosComponentAdmin } from './loggeado/contenedor-agenda-admin/contenedor-agenda.admin.component';
import { TodayViewAdminComponentCompleted } from './loggeado/schedule/today-view-completed/today-view-completed.component';
import { WeekViewAdminComponent } from './loggeado/schedule/week-view/week-view.admin.component';
import { CompanyListComponent } from './android/features/company-list/company-list.component';
import { CategoryListComponent } from './android/features/category-list/category-list.component';

export const routes: Routes = [
  { path: '', component: CategoryListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'ingresar-codigo', component: CategoryListComponent },

  // 👉 Categorías
  { path: 'categoria/:categoryId', component: CompanyListComponent },

  // 👉 Compañías dentro de categorías con agenda
  { path: 'categoria/:categoryId/empresa/:companyName/agenda',
    component: ContenedorAgendaComponent,
    children: [
      {
        path: 'schedule',
        component: ScheduleComponent,
        children: [
          { path: 'month', component: MonthViewComponent },
          { path: 'week', component: WeekViewComponent },
          { path: 'day/:date', component: TodayViewApartarComponent }, // ✅ cliente agenda
          { path: '', redirectTo: 'month', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'schedule', pathMatch: 'full' }
    ]
  },

  { path: 'home', component: MisEventosComponent },

  {
    path: ':numeroSorteo',
    component: EventoComponent,
    children: [
      // 📌 Agenda para clientes
      {
        path: 'agenda',
        component: ContenedorAgendaComponent,
        children: [
          {
            path: 'schedule',
            component: ScheduleComponent,
            children: [
              { path: 'month', component: MonthViewComponent },
              { path: 'week', component: WeekViewComponent },
              { path: 'day/:date', component: TodayViewApartarComponent },
              { path: '', redirectTo: 'month', pathMatch: 'full' }
            ]
          },
          { path: '', redirectTo: 'schedule', pathMatch: 'full' }
        ]
      },

      // 📌 Agenda para admins
      {
        path: 'agenda-admin',
        component: EventosComponentAdmin,
        children: [
          {
            path: 'schedule',
            component: ScheduleComponent,
            children: [
              { path: 'month', component: MonthViewComponent },
              { path: 'week', component: WeekViewAdminComponent },
              { path: 'day/:date', component: TodayViewAdminComponentCompleted },
              { path: '', redirectTo: 'month', pathMatch: 'full' }
            ]
          },
          { path: '', redirectTo: 'schedule', pathMatch: 'full' }
        ]
      },

      { path: 'pagos', component: MetodosPagoComponent },
      { path: 'faq', component: PreguntasFrecuentesComponent },
      { path: 'contacto', component: ContactoComponent },
      { path: 'buscar-cita', component: BuscarCitaComponent },
      { path: 'login', component: LoginComponent },
      { path: 'codigo', component: CategoryListComponent },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  },
];
