import { ScheduleStatus } from '../schedule.types';
import { IsDateString, IsEnum, IsOptional, IsString, MinDate, ValidateIf } from 'class-validator';

export class ScheduleDto {
    @IsDateString()
    @MinDate(
        new Date(),
        { message: 'Дата начала бронирования не может быть меньше текущей' }
    )
    @ValidateIf(
        o => new Date(o.endAt).getTime() < new Date(o.startAt).getTime(),
        { message: 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    )
    startAt: string;

    @IsDateString()
    endAt: string;

    @IsString()
    roomId: string;

    @IsEnum(ScheduleStatus)
    @IsOptional()
    status?: ScheduleStatus;
}