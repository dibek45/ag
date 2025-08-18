export type ScheduleType = 'appointment' | 'event' | 'class-box' | 'class-spinning';

export interface ScheduleDay {
  date: string;
  totalSlots: number;
  availableSlots: number;
}

export interface ScheduleSlot {
  id: string;
  gymId: number;
  date: string;
  startTime: string;
  endTime: string;
  scheduleType: ScheduleType;   // 👈 ahora se usa este
  resourceId?: string;
  capacity?: number;
  bookedCount?: number;
  status: 'available' | 'booked' | 'closed';
  memberId?: number;
  metadata?: Record<string, any>;
}
