import { Routes } from '@angular/router';

// 📄 Páginas generales
import { MetodosPagoComponent } from './pagos/metodos-pago/metodos-pago.component';
import { PreguntasFrecuentesComponent } from './faq/preguntas-frecuentes/preguntas-frecuentes.component';
import { ContactoComponent } from './contacto/contacto/contacto.component';

// 📅 Agenda cliente
import { ScheduleComponent } from './schedule/schedule.component';
import { MonthViewComponent } from './schedule/month-view/month-view.component';
import { ContenedorAgendaComponent } from './contenedor-agenda/contenedor-agenda.component';

// 🏢 Catálogo
import { CompanyListComponent } from './android/features/company-list/company-list.component';
import { CategoryListComponent } from './android/features/category-list/category-list.component';
import { TodaySelectApartarComponent } from './schedule/today-select-apartar/today-select-apartar.component';

export const routes: Routes = [
  // 🏠 Página principal
  { path: '', component: CategoryListComponent },
  { path: 'home', component: CategoryListComponent },

  // ✅ Nueva ruta: empresas dentro de una categoría
  {
    path: 'categoria/:categoryId/empresas',
    component: CompanyListComponent
  },

  // 📂 Categorías → Empresa → Agenda
  {
    path: 'categoria/:categoryId/empresa/:companyName/:adminId/agenda',
    component: ContenedorAgendaComponent,
    children: [
      {
        path: 'schedule',
        component: ScheduleComponent,
        children: [
          { path: 'month', component: MonthViewComponent },
          { path: 'day/:date', component: TodaySelectApartarComponent },
          { path: '', redirectTo: 'month', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'schedule', pathMatch: 'full' }
    ]
  },

  // 💬 Secciones informativas
  { path: 'pagos', component: MetodosPagoComponent },
  { path: 'faq', component: PreguntasFrecuentesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'codigo', component: CategoryListComponent },

  // 🚀 Redirección comodín
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
