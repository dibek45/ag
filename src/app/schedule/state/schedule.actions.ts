// src/app/schedule/state/schedule.actions.ts
import { createActionGroup, props } from '@ngrx/store';
import { ScheduleDay, ScheduleSlot, ScheduleType } from '../models/schedule.models';

export const ScheduleActions = createActionGroup({
  source: 'Schedule',
  events: {
    'Load Range': props<{ gymId: number; scheduleType: ScheduleType; from: string; to: string; forceBackend?: boolean }>(),
    'Load Range Success': props<{ days: ScheduleDay[]; slots: ScheduleSlot[]; gymId: number; scheduleType: ScheduleType }>(),
    'Load Range Failure': props<{ error: any }>(),

    'Select Day': props<{ date: string }>(),

    'Toggle Slot': props<{ slot: ScheduleSlot }>(),
    'Toggle Slot Success': props<{ slot: ScheduleSlot }>(),
    'Toggle Slot Failure': props<{ error: any }>(),
  },
});
