import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateRoomDto } from './dto/create.room.dto';
import { RoomService } from './room.service';
import { ROOM_CREATE_ERROR, ROOM_DELETE_ERROR, ROOM_NOT_FOUND, ROOM_UPDATE_ERROR } from './room.constants';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Model } from 'mongoose';
import { RoomDocument, RoomModel } from './room.model/room.model';

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
            throw new HttpException(ROOM_CREATE_ERROR, HttpStatus.BAD_REQUEST);
        }
        return createdRoom;
    }

    @Get('all')
    async getAllRooms() {
        try {
            return await this.roomService.getAll();
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async roomById(@Param('id') id: string) {
        let room: RoomModel;
        try {
            room = await this.roomService.findById(id);
        } catch (error) {}
        if (!room) {
            throw new NotFoundException(ROOM_NOT_FOUND);
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
            throw new NotFoundException(ROOM_NOT_FOUND);
        }
        try {
            if (await this.roomService.update(id, dto)) {
                return this.roomService.findById(id);
            }
        } catch (error) {
            throw new HttpException(ROOM_UPDATE_ERROR, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        let room: RoomModel;
        try {
            room = await this.roomService.findById(id);
        } catch (error) {}
        if (!room) {
            throw new NotFoundException(ROOM_NOT_FOUND);
        }
        try {
            return await this.roomService.delete(id);
        } catch (error) {
            throw new HttpException(ROOM_DELETE_ERROR, HttpStatus.BAD_REQUEST);
        }
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
