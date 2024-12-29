import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';
import { ROOM_CREATE_ERROR, ROOM_NOT_FOUND } from './room.constants';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @UsePipes(new ValidationPipe())
    @Post('create')
    async create(@Body() dto: CreateRoomDto) {
        const createdRoom = await this.roomService.create(dto);
        if (!createdRoom) {
            throw new HttpException(ROOM_CREATE_ERROR, HttpStatus.BAD_REQUEST);
        }
        return createdRoom;
    }

    @Get('all')
    async getAllRooms() {
        return this.roomService.getAll();
    }

    @Get(':id')
    async roomById(@Param('id') id: string) {
        const room = await this.roomService.findById(id);
        if (!room) {
            throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return room;
    }

    @UsePipes(new ValidationPipe())
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        const room = await this.roomService.findById(id);
        if (!room) {
            throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        if (await this.roomService.update(id, dto)) {
            return this.roomService.findById(id);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const room = await this.roomService.findById(id);
        if (!room) {
            throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return this.roomService.delete(id);
    }

    @Delete('delete/:id')
    async hardDelete(@Param('id') id: string) {
        const deleted = await this.roomService.hardDelete(id);
        if (!deleted) {
            throw new HttpException(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return deleted;
    }
}
