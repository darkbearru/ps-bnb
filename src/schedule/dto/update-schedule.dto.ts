import { ScheduleStatus } from '../schedule.types';

export class UpdateScheduleDto {
    startAt: string;
    endAt: string;
    roomId: string;
}