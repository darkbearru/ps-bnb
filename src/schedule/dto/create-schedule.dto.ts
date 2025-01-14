import { ScheduleStatus } from '../schedule.types';

export class CreateScheduleDto {
    startAt: string;
    endAt: string;
    roomId: string;
}