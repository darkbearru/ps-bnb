import { RoomTypes } from '../room.types';
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
	MinLength,
	ValidateNested,
} from 'class-validator';
import {
	ROOM_AMENITIES_ERROR,
	ROOM_DESCRIPTION_ERROR,
	ROOM_IMAGES_ARRAY_ERROR,
	ROOM_IMAGES_ERROR,
	ROOM_MAX_LENGTH_ERROR,
	ROOM_MAX_SQUARE_ERROR,
	ROOM_MIN_LENGTH_ERROR,
	ROOM_MIN_SQUARE_ERROR,
	ROOM_NAME_ERROR,
	ROOM_NUMBER_ERROR,
	ROOM_SQUARE_ERROR,
	ROOM_TYPE_ERROR,
} from '../room.constants';
import { Type } from 'class-transformer';
import { RoomImagesDto } from './create-room.dto';

export class UpdateRoomDto {
	@IsOptional()
	@IsNumber({}, { message: ROOM_NUMBER_ERROR })
	num?: number;

	@IsOptional()
	@IsEnum(RoomTypes, { message: ROOM_TYPE_ERROR })
	type?: RoomTypes;

	@IsOptional()
	@IsString({ message: ROOM_NAME_ERROR })
	@MinLength(4, { message: ROOM_MIN_LENGTH_ERROR })
	@MaxLength(50, { message: ROOM_MAX_LENGTH_ERROR })
	name?: string;

	@IsOptional()
	@IsNumber({}, { message: ROOM_SQUARE_ERROR })
	@Min(10, { message: ROOM_MIN_SQUARE_ERROR })
	@Max(2000, { message: ROOM_MAX_SQUARE_ERROR })
	square?: number;

	@IsOptional()
	@IsString({ message: ROOM_DESCRIPTION_ERROR })
	description?: string;

	@IsOptional()
	@IsArray({ message: ROOM_AMENITIES_ERROR })
	@IsString({ each: true, message: ROOM_IMAGES_ERROR })
	amenities?: string[];

	@IsOptional()
	@IsArray({ message: ROOM_IMAGES_ERROR })
	@ValidateNested({ message: ROOM_IMAGES_ARRAY_ERROR })
	@Type(() => RoomImagesDto)
	images: RoomImagesDto[];
}
