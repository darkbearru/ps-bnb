import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	InternalServerErrorException,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';
import {
	ROOM_CREATE_ERROR,
	ROOM_DELETE_ERROR,
	ROOM_INTERNAL_ERROR,
	ROOM_NOT_FOUND_ERROR,
	ROOM_UPDATE_ERROR,
} from './room.constants';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomModel } from './room.model/room.model';
import { Roles } from '../decorators/auth-roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserRole } from '../users/users.roles';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IdValidationPipe } from '../auth/pipes/id-validation.pipe';

@Controller('room')
export class RoomController {
	constructor(private readonly roomService: RoomService) {}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@UsePipes(new ValidationPipe())
	@Post('create')
	async create(@Body() dto: CreateRoomDto) {
		let createdRoom: RoomModel;
		try {
			createdRoom = await this.roomService.create(dto);
		} catch (error) {
			console.log(error);
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
	async roomById(@Param('id', IdValidationPipe) id: string) {
		let room: RoomModel;
		try {
			room = await this.roomService.findById(id);
		} catch (error) {
			console.log(error);
		}
		if (!room) {
			throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
		}
		return room;
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@UsePipes(new ValidationPipe())
	@Patch(':id')
	async update(@Param('id', IdValidationPipe) id: string, @Body() dto: UpdateRoomDto) {
		let room: RoomModel;
		try {
			room = await this.roomService.findById(id);
		} catch (error) {
			console.log(error);
		}
		if (!room) {
			throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
		}
		try {
			if (await this.roomService.update(id, dto)) {
				return this.roomService.findById(id);
			}
		} catch (error) {
			console.log(error);
			throw new BadRequestException(ROOM_UPDATE_ERROR);
		}
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		let room: RoomModel;
		try {
			room = await this.roomService.findById(id);
		} catch (error) {
			console.log(error);
		}
		if (!room) {
			throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
		}
		try {
			return await this.roomService.delete(id);
		} catch (error) {
			console.log(error);
			throw new BadRequestException(ROOM_DELETE_ERROR);
		}
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Delete('delete/:id')
	async hardDelete(@Param('id', IdValidationPipe) id: string) {
		const deleted = await this.roomService.hardDelete(id);
		if (!deleted) {
			throw new NotFoundException(ROOM_NOT_FOUND_ERROR);
		}
		return deleted;
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Get('stats/:year/:month')
	async stats(
		@Param('year', ParseIntPipe) year: number,
		@Param('month', ParseIntPipe) month: number,
	) {
		const stats = await this.roomService.getStats(month - 1, year);
		if (!stats) {
			throw new InternalServerErrorException(ROOM_INTERNAL_ERROR);
		}
		return stats;
	}
}
