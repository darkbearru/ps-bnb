import { RoomTypes } from '../room.types';
import { IsArray, IsEnum, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import {
    ROOM_AMENITIES_ERROR,
    ROOM_DESCRIPTION_ERROR,
    ROOM_MAX_LENGTH_ERROR,
    ROOM_MAX_SQUARE_ERROR,
    ROOM_MIN_LENGTH_ERROR,
    ROOM_MIN_SQUARE_ERROR,
    ROOM_NAME_ERROR, ROOM_NUMBER_ERROR, ROOM_SQUARE_ERROR,
    ROOM_TYPE_ERROR,
} from '../room.constants';

export class CreateRoomDto {
    @IsNumber({}, { message: ROOM_NUMBER_ERROR })
    num: number;

    @IsEnum(RoomTypes, { message: ROOM_TYPE_ERROR })
    type: RoomTypes;

    @IsString({ message: ROOM_NAME_ERROR })
    @MinLength(4, { message: ROOM_MIN_LENGTH_ERROR })
    @MaxLength( 50, { message: ROOM_MAX_LENGTH_ERROR })
    name: string;

    @IsNumber({}, { message: ROOM_SQUARE_ERROR })
    @Min(10, { message: ROOM_MIN_SQUARE_ERROR })
    @Max(2000, { message: ROOM_MAX_SQUARE_ERROR })
    square: number;

    @IsString({ message: ROOM_DESCRIPTION_ERROR })
    description: string;

    @IsArray({ message: ROOM_AMENITIES_ERROR })
    amenities: string[];
}