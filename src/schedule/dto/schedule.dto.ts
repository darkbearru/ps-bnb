import { ScheduleStatus } from '../schedule.types';

export class ScheduleDto {
    startAt: string;
    endAt: string;
    roomId: string;
    status?: ScheduleStatus;
}