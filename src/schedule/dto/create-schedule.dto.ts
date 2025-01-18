import { IsDateString, IsString, MinDate, ValidateIf } from 'class-validator';
import { SCHEDULE_NOT_DATE_ERROR, SCHEDULE_START_AT_ERROR, SCHEDULE_START_IF_ERROR } from '../schedule.constants';

export class CreateScheduleDto {
    @IsDateString({}, { message: SCHEDULE_NOT_DATE_ERROR })
    @MinDate(
        new Date(),
        { message: SCHEDULE_START_AT_ERROR }
    )
    @ValidateIf(
        o => new Date(o.endAt).getTime() < new Date(o.startAt).getTime(),
        { message: SCHEDULE_START_IF_ERROR }
    )
    startAt: string;

    @IsDateString({}, { message: SCHEDULE_NOT_DATE_ERROR })
    endAt: string;

    @IsString()
    roomId: string;
}