import { RoomTypes } from '../room.types';

export class UpdateRoomDto {
    num: number;
    type: RoomTypes;
    name: string;
    square: number;
    description: string;
    amenities: string[];
}