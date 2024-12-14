import { RoomTypes } from '../room.types';

export class RoomDto {
    num: number;
    type: RoomTypes;
    name: string;
    square: number;
    description: string;
    amenities: string[];
}