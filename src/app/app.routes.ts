// app.routes.ts
import { Routes } from '@angular/router';
import { BoletosComponent } from './boletos/boletos.component';
import { MetodosPagoComponent } from './pagos/metodos-pago/metodos-pago.component';
import { PreguntasFrecuentesComponent } from './faq/preguntas-frecuentes/preguntas-frecuentes.component';
import { ContactoComponent } from './contacto/contacto/contacto.component';
import { GenerateTicketComponent } from './generate-ticket/generate-ticket.component';
import { BuscarBoletoComponent } from './buscar-boleto/buscar-boleto.component';
import { WelcomeComponent } from './android/features/welcome/welcome.component';
import { IngresarCodigoComponent } from './android/features/ingresar-codigo/ingresar-codigo.component';
import { LoginComponent } from './android/features/login/login.component';
import { MisRifasComponent } from './android/features/main-dashboard/dashboard-home/dashboard-home.component';
import { DashboardComponent } from './android/features/dashboard/dashboard.component';
import { SorteoComponent } from './sorteo/dashboard.sorteo.component';

// 👇 imports para agenda (schedule)
import { ScheduleComponent } from './schedule/schedule.component';
import { MonthViewComponent } from './schedule/month-view/month-view.component';
import { WeekViewComponent } from './schedule/week-view/week-view.component';
import { TodayViewComponent } from './schedule/today-view-completed/today-view-completed.component';
import { TodayViewApartarComponent } from './schedule/today-view-apartar/today-view-apartar.component';

export const routes: Routes = [

  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'ingresar-codigo', component: IngresarCodigoComponent },
  { path: 'home', component: MisRifasComponent },

  { path: 'rifa/:id', component: DashboardComponent },

  {
    path: ':numeroSorteo',
    component: SorteoComponent,
    children: [
      {
        path: 'agenda',
        component: BoletosComponent,
        children: [
          {
            path: 'schedule',
            component: ScheduleComponent,
            children: [
              { path: 'month', component: MonthViewComponent },
              { path: 'week', component: WeekViewComponent },
              { path: 'day/:date', component: TodayViewApartarComponent }, // ✅ aquí la vista por día
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
      { path: 'generateTicket', component: GenerateTicketComponent },
      { path: 'login', component: LoginComponent },
      { path: 'codigo', component: IngresarCodigoComponent },
      { path: '', redirectTo: 'agenda', pathMatch: 'full' }
    ]
  },

];
