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
import { ConfirmarCitaModalComponent } from '../../android/features/cambiar-estado-modal/confirmar-cita-modal.component';

@Component({
  selector: 'app-today-select-apartar',
  standalone: true,
  imports: [CommonModule, ServicioSelectorComponent, ConfirmarCitaModalComponent],
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
  horaSeleccionada: string = '';
  horaFin: string = '';
  fechaSeleccionada?: Date;

  mostrarConfirmacion = false;

  constructor(
    private store: Store<AppState>,
    public citaService: CitaService
  ) {}

  ngOnInit(): void {
    this.evento$ = this.store.select(selectAllEventos).pipe(map(evs => evs[0]));

    this.evento$.subscribe(ev => {
      if (!ev) return;
      this.evento = ev;
      this.diasVisibles = this.citaService.generarDias(this.indiceBase);
      this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
    });
  }

  seleccionarServicio(servicio: Servicio | null) {
    this.servicioSeleccionado = servicio || undefined;
    if (!this.evento) return;
    this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  }

  siguiente() {
    this.indiceBase += 3;
    this.diasVisibles = this.citaService.generarDias(this.indiceBase);
    this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  }

  anterior() {
    if (this.indiceBase > 0) {
      this.indiceBase -= 3;
      this.diasVisibles = this.citaService.generarDias(this.indiceBase);
      this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
    }
  }

  reservar(fecha: Date, hora: string) {
    if (!this.evento || !this.servicioSeleccionado) {
      alert('Selecciona un servicio primero.');
      return;
    }

    const duracion = this.servicioSeleccionado.duracionMin ?? 30;
    const inicio = new Date(`${fecha.toISOString().substring(0, 10)}T${hora}`);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    this.fechaSeleccionada = fecha;
    this.horaSeleccionada = hora;
    this.horaFin = fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    this.mostrarConfirmacion = true;
  }

  confirmarCita() {
    if (!this.evento || !this.servicioSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) return;
    this.mostrarConfirmacion = false;
    this.citaService.reservarCita(this.evento, this.servicioSeleccionado, this.fechaSeleccionada, this.horaSeleccionada);
  }

  cancelarCita() {
    this.mostrarConfirmacion = false;
  }
}
