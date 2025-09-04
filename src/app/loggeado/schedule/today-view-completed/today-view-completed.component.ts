import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Appointment {
  time: string;
  service: string;
  duration: string;
  client: string;
  color: string;
}

@Component({
  selector: 'app-today-view-compleed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-view.completed.component.html',
  styleUrls: ['./today-view.completed.component.scss']
})
export class TodayViewAdminComponentCompleted implements OnInit {
  date!: string;
slotSeleccionado: { fecha: Date } | null = null;
currentDate: Date = new Date();
  appointments: Appointment[] = [
    { time: '9:00', service: 'Paranga extension', duration: '1h 30m', client: 'Emma', color: '#7c3aed' },
    { time: '11:00', service: 'Fanny Acosta', duration: '2h', client: 'Julia', color: '#f87171' },
    { time: '2:00', service: 'David Velazquez Hernandez', duration: '45m', client: 'Olivia', color: '#34d399' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.date = this.route.snapshot.paramMap.get('date') ?? '';
    console.log('📅 Fecha seleccionada:', this.date);
  }

  
cambiarDia(dias: number) {
  const fechaActual = new Date(this.slotSeleccionado?.fecha || this.currentDate);
  fechaActual.setDate(fechaActual.getDate() + dias);
  this.slotSeleccionado = { ...this.slotSeleccionado, fecha: fechaActual };
  // Aquí puedes recargar horarios/citas según la nueva fecha
}
}
