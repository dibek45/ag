// src/app/schedule/services/schedule.service.ts
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ScheduleDay, ScheduleSlot, ScheduleType } from './models/schedule.models';

// ✅ Datos mock van fuera de la clase
const MOCK_DAYS: ScheduleDay[] = [
  { date: '2025-08-18', totalSlots: 5, availableSlots: 3 },
  { date: '2025-08-19', totalSlots: 4, availableSlots: 1 },
];

const MOCK_SLOTS: ScheduleSlot[] = [
    {
    id: '3',
    gymId: 101,
    date: '2025-08-28',
    startTime: '08:00',
    endTime: '09:00',
    scheduleType: 'class-box',
    capacity: 15,
    bookedCount: 7,
    status: 'available'
  },    
  {
    id: '1',
    gymId: 101,
    date: '2025-08-18',
    startTime: '08:00',
    endTime: '09:00',
    scheduleType: 'class-box',
    capacity: 15,
    bookedCount: 7,
    status: 'available'
  },
  {
    id: '2',
    gymId: 101,
    date: '2025-08-18',
    startTime: '09:00',
    endTime: '10:00',
    scheduleType: 'appointment',
    status: 'booked',
    memberId: 45
  }
];

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private mockDays = MOCK_DAYS;
  private mockSlots = MOCK_SLOTS;

  constructor() {}

  // ✅ Traer rangos de días y slots (mock)
  getRange(gymId: number, scheduleType: ScheduleType, from: string, to: string) {
    return of({ days: this.mockDays, slots: this.mockSlots }).pipe(delay(500));
  }

  // ✅ Cambiar estado de un slot (mock)
  toggleSlot(slotId: string, payload: { memberId?: number }) {
    const slot = this.mockSlots.find(s => s.id === slotId);
    if (slot) {
      if (slot.status === 'available') {
        slot.status = 'booked';
        slot.memberId = payload.memberId ?? 999;
      } else {
        slot.status = 'available';
        delete slot.memberId;
      }
    }
    return of({ slot }).pipe(delay(300));
  }
}
