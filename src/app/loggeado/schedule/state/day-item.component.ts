// src/app/schedule/components/day-item/day-item.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleDay } from '../models/schedule.models';

@Component({
  selector: 'app-day-item',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="day-card" (click)="select.emit(day)">
    <div class="date">{{ day.date }}</div>
    <div class="stats">
      <span>{{ day.availableSlots }}/{{ day.totalSlots }} available</span>
    </div>
  </div>
  `,
  styles: [`
    .day-card { cursor:pointer; border:1px solid #eee; border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:6px }
    .date { font-weight:700 }
    .stats { font-size:.9rem; opacity:.8 }
  `]
})
export class DayItemComponent {
  @Input() day!: ScheduleDay;
  @Output() select = new EventEmitter<ScheduleDay>();
}
