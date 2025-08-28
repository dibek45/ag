// src/app/schedule/state/schedule.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScheduleState, ScheduleSlice } from './schedule.reducer';
import { ScheduleType } from '../models/schedule.models';

export const selectScheduleState = createFeatureSelector<ScheduleState>('schedule');

const getSlice = (state: ScheduleState, gymId: number, type: ScheduleType): ScheduleSlice | undefined =>
  state.data[gymId]?.[type];

export const selectDaysFor = (gymId: number, type: ScheduleType) => createSelector(
  selectScheduleState,
  (state) => Object.values(getSlice(state, gymId, type)?.daysByDate || {}).sort((a,b)=>a.date.localeCompare(b.date))
);

export const selectSelectedDateFor = (gymId: number, type: ScheduleType) => createSelector(
  selectScheduleState,
  (state) => getSlice(state, gymId, type)?.selectedDate
);

export const selectSlotsForDay = (gymId: number, type: ScheduleType, date: string) => createSelector(
  selectScheduleState,
  (state) => {
    const slice = getSlice(state, gymId, type);
    if (!slice) return [];
    const ids = slice.byDate[date] || [];
    return ids.map(id => slice.slotsById[id]);
  }
);
