// src/app/schedule/state/schedule.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ScheduleActions } from './schedule.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class ScheduleEffects {
  loadRange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.loadRange),
      mergeMap(({ gymId, scheduleType, from, to }) =>
        this.scheduleService.getRange(gymId, scheduleType, from, to).pipe(
          map(({ days, slots }) =>
            ScheduleActions.loadRangeSuccess({ days, slots, gymId, scheduleType })
          ),
          catchError(error => of(ScheduleActions.loadRangeFailure({ error })))
        )
      )
    )
  );

  toggleSlot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.toggleSlot),
      mergeMap(({ slot }) =>
        this.scheduleService.toggleSlot(slot.id, { memberId: slot.memberId }).pipe(
          map(res => ScheduleActions.toggleSlotSuccess({ slot: { ...slot, ...res.slot } })),
          catchError(error => of(ScheduleActions.toggleSlotFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private scheduleService: ScheduleService) {}
}
