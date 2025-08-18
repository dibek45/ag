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
  selector: 'app-today-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-view.component.html',
  styleUrls: ['./today-view.component.scss']
})
export class TodayViewComponent implements OnInit {
  date!: string;

  appointments: Appointment[] = [
    { time: '9:00', service: 'Lash extension', duration: '1h 30m', client: 'Emma', color: '#7c3aed' },
    { time: '11:00', service: 'Acrylic nails', duration: '2h', client: 'Julia', color: '#f87171' },
    { time: '2:00', service: 'Gel polish', duration: '45m', client: 'Olivia', color: '#34d399' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.date = this.route.snapshot.paramMap.get('date') ?? '';
    console.log('📅 Fecha seleccionada:', this.date);
  }
}
