import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AppState } from '../../state/app.state';
import { selectAllEventos } from '../../state/evento/evento.selectors';
import { CitaService } from '../../state/servicios/cita.service';
import { Evento, Servicio } from '../../state/evento/evento.model';
import { ServicioSelectorComponent } from './servicio-selector/servicio-selector.component';

@Component({
  selector: 'app-today-select-apartar',
  standalone: true,
  imports: [CommonModule, ServicioSelectorComponent],
  templateUrl: './today-select-apartar.component.html',
  styleUrls: ['./today-select-apartar.component.scss']
})
export class TodaySelectApartarComponent implements OnInit {
  evento$!: Observable<Evento | undefined>;
  evento?: Evento;

  diasVisibles: Date[] = [];
  indiceBase = 0;
  servicioSeleccionado?: Servicio;
  horasDisponibles: { [fecha: string]: { label: string; ocupada: boolean }[] } = {};
  horaSeleccionada: any;

  constructor(
    private store: Store<AppState>,
    public citaService: CitaService
  ) {}

  ngOnInit(): void {
  this.evento$ = this.store.select(selectAllEventos).pipe(map(evs => evs[0]));

  this.evento$.subscribe(ev => {
    console.log('🟢 Evento recibido:', ev);

    if (!ev) {
      console.warn('⚠️ No hay evento cargado.');
      return;
    }

    this.evento = ev;

    // Generar días visibles
    this.diasVisibles = this.citaService.generarDias(this.indiceBase);
    console.log('📅 Días visibles generados:', this.diasVisibles.map(d => d.toISOString().substring(0, 10)));

    // Generar horas disponibles
    this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
    console.log('⏰ Horas disponibles iniciales:', this.horasDisponibles);
  });
}

seleccionarServicio(servicio: Servicio | null) {
  this.servicioSeleccionado = servicio || undefined;
  console.log('💅 Servicio seleccionado:', this.servicioSeleccionado);

  if (!this.evento) {
    console.warn('⚠️ No hay evento aún, no se pueden generar horas.');
    return;
  }

  this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  console.log('🔁 Horas recalculadas:', this.horasDisponibles);
}


  siguiente() {
    this.indiceBase += 3;
    this.diasVisibles = this.citaService.generarDias(this.indiceBase);
    this.horasDisponibles = this.citaService.generarHoras(
      this.evento,
      this.servicioSeleccionado,
      this.diasVisibles
    );
  }

  anterior() {
    if (this.indiceBase > 0) {
      this.indiceBase -= 3;
      this.diasVisibles = this.citaService.generarDias(this.indiceBase);
      this.horasDisponibles = this.citaService.generarHoras(
        this.evento,
        this.servicioSeleccionado,
        this.diasVisibles
      );
    }
  }

  reservar(fecha: Date, hora: string) {
    if (!this.evento || !this.servicioSeleccionado) {
      alert('Selecciona un servicio primero.');
      return;
    }
    this.citaService.reservarCita(this.evento, this.servicioSeleccionado, fecha, hora);
  }

  cancelar() {
    alert('Cita cancelada');
  }
}
