// app.routes.ts
import { Routes } from '@angular/router';
import { MetodosPagoComponent } from './pagos/metodos-pago/metodos-pago.component';
import { PreguntasFrecuentesComponent } from './faq/preguntas-frecuentes/preguntas-frecuentes.component';
import { ContactoComponent } from './contacto/contacto/contacto.component';
import { BuscarBoletoComponent } from './buscar-boleto/buscar-boleto.component';
import { WelcomeComponent } from './android/features/welcome/welcome.component';
import { IngresarCodigoComponent } from './android/features/ingresar-codigo/ingresar-codigo.component';
import { LoginComponent } from './android/features/login/login.component';
import { MisEventosComponent } from './android/features/main-dashboard/dashboard-home/dashboard-home.component';
import { DashboardComponent } from './android/features/dashboard/dashboard.component';

// 👇 imports de rifa/evento


// 👇 imports para agenda (schedule)
import { ScheduleComponent } from './schedule/schedule.component';
import { MonthViewComponent } from './schedule/month-view/month-view.component';
import { WeekViewComponent } from './schedule/week-view/week-view.component';
import { TodayViewComponent } from './schedule/today-view-completed/today-view-completed.component';
import { TodayViewApartarComponent } from './schedule/today-view-apartar/today-view-apartar.component';
import { EventoComponent } from './sorteo/dashboard.sorteo.component';
import { EventosComponent } from './contenedor-agenda/contenedor-agenda.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'ingresar-codigo', component: IngresarCodigoComponent },
  { path: 'home', component: MisEventosComponent },

  // 📌 Vista de rifa individual
  { path: 'rifa/:id', component: DashboardComponent },

  // 📌 Entrar a una rifa por numeroSorteo
  {
    path: ':numeroSorteo',
    component: EventoComponent,
    children: [
      {
        path: 'agenda',
        component: EventosComponent,
        children: [
          {
            path: 'schedule',
            component: ScheduleComponent,
            children: [
              { path: 'month', component: MonthViewComponent },
              { path: 'week', component: WeekViewComponent },
              { path: 'day/:date', component: TodayViewApartarComponent }, // ✅ vista por día
              { path: '', redirectTo: 'month', pathMatch: 'full' }
            ]
          },
          { path: '', redirectTo: 'schedule', pathMatch: 'full' }
        ]
      },
      { path: 'pagos', component: MetodosPagoComponent },
      { path: 'faq', component: PreguntasFrecuentesComponent },
      { path: 'contacto', component: ContactoComponent },
      { path: 'buscar-boleto', component: BuscarBoletoComponent },
   //   { path: 'generateTicket', component: GenerateTicketComponent },
      { path: 'login', component: LoginComponent },
      { path: 'codigo', component: IngresarCodigoComponent },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  },
];
