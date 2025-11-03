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
import { ActivatedRoute } from '@angular/router';

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
  public citaService: CitaService,
  private route: ActivatedRoute
) {}

 ngOnInit(): void {
  this.evento$ = this.store.select(selectAllEventos).pipe(map(evs => evs[0]));

  this.evento$.subscribe(ev => {
    if (!ev) return;

    console.log('🎯 Evento recibido:', ev);
    console.log('📅 Citas cargadas:', ev.citas);

    this.evento = ev;
this.diasVisibles = this.citaService.generarDias(this.indiceBase, ev);

    // 🕒 Esperar un poco si las citas todavía no se cargan
    if (!ev.citas || ev.citas.length === 0) {
      console.log('⚠️ Evento sin citas, esperando...');
      setTimeout(() => {
        this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
      }, 300);
      return;
    }

    // ✅ Citas detectadas, generar horas normalmente
    console.log('✅ Citas detectadas:', ev.citas);
    this.horasDisponibles = this.citaService.generarHoras(ev, this.servicioSeleccionado, this.diasVisibles);
  });
  this.route.paramMap.subscribe(params => {
  const dateStr = params.get('date');
  if (dateStr) {
    this.fechaSeleccionada = new Date(dateStr);
    console.log('📅 Fecha seleccionada desde calendario:', this.fechaSeleccionada);
  } else {
    this.fechaSeleccionada = new Date();
    console.log('📅 Usando fecha de hoy:', this.fechaSeleccionada);
  }

  // ✅ regenerar días centrados en la fecha seleccionada
  if (this.evento && this.fechaSeleccionada) {
    this.diasVisibles = this.citaService.generarDias(
      this.indiceBase,
      this.evento,
      this.fechaSeleccionada
    );

    this.horasDisponibles = this.citaService.generarHoras(
      this.evento,
      this.servicioSeleccionado,
      this.diasVisibles
    );
  }
});


}


  seleccionarServicio(servicio: Servicio | null) {
    this.servicioSeleccionado = servicio || undefined;
    if (!this.evento) return;
    this.horasDisponibles = this.citaService.generarHoras(this.evento, this.servicioSeleccionado, this.diasVisibles);
  }

  siguiente() {
    this.indiceBase += 3;
    this.diasVisibles = this.citaService.generarDias(this.indiceBase, this.evento);
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
const fechaUsar = this.fechaSeleccionada || fecha;
const inicio = new Date(`${fechaUsar.toISOString().substring(0, 10)}T${hora}`);
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
