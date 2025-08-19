import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Evento } from '../state/evento/evento.model';
import { selectEventosByAdmin } from '../state/evento/evento.selectors'; // 👈 importar el correcto
import * as EventoActions from '../state/evento/evento.actions';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sorteo.component.html',
  styleUrls: ['./sorteo.component.scss'],
})
export class EventoComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  logoUrl = '';
  eventos$!: Observable<Evento[]>;

  ngOnInit(): void {
    this.cargaDesdeStore();
  }

  private cargaDesdeStore() {
    const adminId = Number(this.route.snapshot.paramMap.get('adminId'));
    console.log('🧪 Param adminId recibido:', adminId);

    if (!adminId || isNaN(adminId)) {
      console.error('❌ adminId inválido en la URL:', adminId);
      return;
    }

    // 🟩 Cargar eventos de este admin
    this.store
      .select(selectEventosByAdmin(adminId)) // ✅ usamos selector dinámico
      .pipe(take(1))
      .subscribe((eventos) => {
        if (!eventos || eventos.length === 0) {
          console.log('📤 Despachando loadEventos para admin:', adminId);
          this.store.dispatch(EventoActions.loadEventos({ adminId }));
        } else {
          console.log('✅ Ya hay eventos en el store.');
        }
      });

    // Suscripción para la vista
    this.eventos$ = this.store.select(selectEventosByAdmin(adminId)); // ✅ observable con filtro

    // Logo (si tienes logo por admin)
    this.logoUrl = `https://api.agenda.sa.dibeksolutions.com/uploads/admins/${adminId}.png`;
  }

  logoFallback() {
    this.logoUrl = 'assets/default-admin.png';
  }
}
