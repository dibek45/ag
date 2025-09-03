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
export class TodayViewComponentCompleted implements OnInit {
  date!: string;

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
}
