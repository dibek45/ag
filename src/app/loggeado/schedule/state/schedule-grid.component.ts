// src/app/schedule/components/schedule-grid/schedule-grid.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ScheduleDay, ScheduleType } from '../models/schedule.models';
import { DayItemComponent } from './day-item.component';
import { selectDaysFor } from './schedule.selectors';
import { ScheduleActions } from './schedule.actions';

@Component({
  selector: 'app-schedule-grid',
  standalone: true,
  imports: [CommonModule, DayItemComponent],
  template: `
  <div class="grid">
    <app-day-item
      *ngFor="let day of days$ | async"
      [day]="day"
      (select)="handleSelectDay($event)">
    </app-day-item>
  </div>
  `,
  styles:[`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}`]
})
export class ScheduleGridComponent implements OnInit {
  @Input() gymId!: number;
  @Input() type: ScheduleType = 'appointment';
  @Input() from!: string; // e.g., '2025-08-01'
  @Input() to!: string;   // e.g., '2025-08-31'
  @Output() daySelected = new EventEmitter<string>();

  days$!: Observable<ScheduleDay[]>;

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.days$ = this.store.select(selectDaysFor(this.gymId, this.type));
this.store.dispatch(ScheduleActions.loadRange({ gymId: this.gymId, scheduleType: this.type, from: this.from, to: this.to }));
  }

  handleSelectDay(day: ScheduleDay) {
    this.store.dispatch(ScheduleActions.selectDay({ date: day.date }));
    this.daySelected.emit(day.date);
    // Navigate like your boleto flow
    this.router.navigate(['day', day.date], { relativeTo: this.route });
  }
}
