import { RoomTypes } from '../room.types';
import { IsArray, IsEnum, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class RoomDto {
    @IsNumber()
    num: number;

    @IsEnum(RoomTypes, { message: 'Тип номера не соответствует имеющимся вариантам' })
    type: RoomTypes;

    @IsString({ message: 'Название номера должно быть текстовым' })
    @MinLength(4, { message: 'Минимальная длина названия 4 символа' })
    @MaxLength( 50, { message: 'Максимальная длина названия 50 символов' })
    name: string;

    @IsNumber()
    @Min(15, { message: 'Минимальная площадь номера от 15 кв. м.' })
    @Max(4000, { message: 'Максимальная площадь номера до 4000 кв. м.' })
    square: number;

    @IsString({ message: 'Описание номера должно быть текстовым' })
    description: string;

    @IsArray({ message: 'Список удобств должен быть текстовым массивом' })
    amenities: string[];
}