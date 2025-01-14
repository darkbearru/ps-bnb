import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Post, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';
import { ROOM_CREATE_ERROR, ROOM_DELETE_ERROR, ROOM_NOT_FOUND_ERROR, ROOM_UPDATE_ERROR } from './room.constants';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomModel } from './room.model/room.model';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @UsePipes(new ValidationPipe())
    @Post('create')
    async create(@Body() dto: CreateRoomDto) {
        let createdRoom: RoomModel;
        try {
            createdRoom = await this.roomService.create(dto);
        } catch (error) {
        }
        if (!createdRoom) {
            throw new BadRequestException(ROOM_CREATE_ERROR);
        }
        return createdRoom;
    }

    @Get('all')
    async getAllRooms() {
        try {
            return await this.roomService.getAll();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    @Get(':id')
    async roomById(@Param('id') id: string) {
        let room: RoomModel;
        try {
            room = await this.roomService.findById(id);
        } catch (error) {}
        if (!room) {
            throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
        }
        return room;
    }

    @UsePipes(new ValidationPipe())
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        let room: RoomModel;
        try {
            room = await this.roomService.findById(id);
        } catch (error) {}
        if (!room) {
            throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
        }
        try {
            if (await this.roomService.update(id, dto)) {
                return this.roomService.findById(id);
            }
        } catch (error) {
            throw new BadRequestException(ROOM_UPDATE_ERROR);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        let room: RoomModel;
        try {
            room = await this.roomService.findById(id);
        } catch (error) {}
        if (!room) {
            throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
        }
        try {
            return await this.roomService.delete(id);
        } catch (error) {
            throw new BadRequestException(ROOM_DELETE_ERROR);
        }
    }

    @Delete('delete/:id')
    async hardDelete(@Param('id') id: string) {
        const deleted = await this.roomService.hardDelete(id);
        if (!deleted) {
            throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
        }
        return deleted;
    }
}
