// src/app/schedule/state/schedule.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ScheduleActions } from './schedule.actions';
import { ScheduleDay, ScheduleSlot, ScheduleType } from '../models/schedule.models';

export interface ScheduleSlice {
  daysByDate: { [date: string]: ScheduleDay };
  slotsById:  { [id: string]: ScheduleSlot };
  byDate:     { [date: string]: string[] }; // date -> slotIds
  selectedDate?: string;
  loading: boolean;
}

export interface ScheduleState {
  // gymId -> scheduleType -> slice
  data: { [gymId: number]: { [scheduleType in ScheduleType]?: ScheduleSlice } };
}

const initialSlice: ScheduleSlice = {
  daysByDate: {},
  slotsById: {},
  byDate: {},
  loading: false,
};

const initialState: ScheduleState = { data: {} };

function ensureSlice(state: ScheduleState, gymId: number, scheduleType: ScheduleType): ScheduleSlice {
  return state.data[gymId]?.[scheduleType] || initialSlice;
}

export const scheduleReducer = createReducer(
  initialState,

  on(ScheduleActions.loadRange, (state, { gymId, scheduleType }) => {
    const slice = { ...ensureSlice(state, gymId, scheduleType), loading: true };
    return {
      ...state,
      data: {
        ...state.data,
        [gymId]: { ...(state.data[gymId] || {}), [scheduleType]: slice },
      },
    };
  }),

  on(ScheduleActions.loadRangeSuccess, (state, { days, slots, gymId, scheduleType }) => {
    const prev = ensureSlice(state, gymId, scheduleType);
    const daysByDate = { ...prev.daysByDate };
    const slotsById = { ...prev.slotsById };
    const byDate: Record<string, string[]> = { ...prev.byDate };

    for (const d of days) daysByDate[d.date] = d;
    for (const s of slots) {
      slotsById[s.id] = s;
      byDate[s.date] = byDate[s.date] || [];
      if (!byDate[s.date].includes(s.id)) byDate[s.date].push(s.id);
    }

    const slice: ScheduleSlice = { ...prev, daysByDate, slotsById, byDate, loading: false };

    return {
      ...state,
      data: {
        ...state.data,
        [gymId]: { ...(state.data[gymId] || {}), [scheduleType]: slice },
      },
    };
  }),

  on(ScheduleActions.selectDay, (state, { date }) => {
    // si quieres que sea por gymId/scheduleType pásalo en la action
    const data = { ...state.data };
    for (const gymKey of Object.keys(data)) {
      const types = { ...data[+gymKey] };
      for (const t of Object.keys(types) as ScheduleType[]) {
        const slice = { ...(types[t] as ScheduleSlice) };
        slice.selectedDate = date;
        types[t] = slice;
      }
      data[+gymKey] = types;
    }
    return { ...state, data };
  }),

  on(ScheduleActions.toggleSlotSuccess, (state, { slot }) => {
    const gymId = slot.gymId;
    const scheduleType = slot.scheduleType; // 👈 también renombrado en el modelo
    const prev = ensureSlice(state, gymId, scheduleType);
    const slotsById = { ...prev.slotsById, [slot.id]: slot };
    const slice: ScheduleSlice = { ...prev, slotsById };
    return {
      ...state,
      data: {
        ...state.data,
        [gymId]: { ...(state.data[gymId] || {}), [scheduleType]: slice },
      },
    };
  })
);
