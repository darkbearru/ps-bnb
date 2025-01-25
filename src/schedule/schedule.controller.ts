import {
	Body,
	Controller,
	Delete,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
	SCHEDULE_CREATE_ERROR,
	SCHEDULE_DELETE_ERROR,
	SCHEDULE_NOT_FOUND,
	SCHEDULE_STATUS_ERROR,
	SCHEDULE_UPDATE_ERROR,
	SCHEDULE_UPDATE_STATUS_ERROR,
} from './schedule.constants';
import { ScheduleStatus } from './schedule.types';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleModel } from './schedule.model/schedule.model';
import { Roles } from '../decorators/auth-roles.decorator';
import { UserRole } from '../users/users.roles';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserPayload } from '../decorators/user-payload.decorator';
import { JwtPayload } from '../types/jwt.types';
import { IdValidationPipe } from '../auth/pipes/id-validation.pipe';

@Controller('schedule')
export class ScheduleController {
	constructor(private readonly scheduleService: ScheduleService) {}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.USER)
	@UsePipes(new ValidationPipe())
	@Post('create')
	async create(@Body() dto: CreateScheduleDto, @UserPayload() payload: JwtPayload) {
		let check: ScheduleModel;
		try {
			check = await this.scheduleService.checkRoom(dto);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		if (check) {
			throw new HttpException(SCHEDULE_CREATE_ERROR, HttpStatus.BAD_REQUEST);
		}
		let added: ScheduleModel;
		try {
			added = await this.scheduleService.create(dto, payload.id);
		} catch (error) {
			console.log(error);
		}
		if (!added) {
			throw new HttpException(SCHEDULE_CREATE_ERROR, HttpStatus.BAD_REQUEST);
		}
		return added;
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.USER)
	@UsePipes(new ValidationPipe())
	@Patch(':id')
	async update(@Param('id', IdValidationPipe) id: string, @Body() dto: UpdateScheduleDto) {
		await this.checkId(id);
		try {
			return await this.scheduleService.update(id, dto);
		} catch (e) {
			console.log(e);
			throw new HttpException(SCHEDULE_UPDATE_ERROR, HttpStatus.BAD_REQUEST);
		}
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.USER)
	@Delete(':id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		await this.checkId(id);
		try {
			return await this.scheduleService.delete(id);
		} catch (error) {
			console.log(error);
			throw new HttpException(SCHEDULE_DELETE_ERROR, HttpStatus.BAD_REQUEST);
		}
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Delete('/delete/:id')
	async hardDelete(@Param('id', IdValidationPipe) id: string) {
		await this.checkId(id);
		return this.scheduleService.hardDelete(id);
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Patch('updateStatus/:id/:status')
	async updateStatus(@Param('id', IdValidationPipe) id: string, @Param('status') status: number) {
		await this.checkId(id);
		if (!(status in Object.values(ScheduleStatus))) {
			throw new HttpException(SCHEDULE_STATUS_ERROR, HttpStatus.BAD_REQUEST);
		}
		try {
			return this.scheduleService.changeStatus(id, status);
		} catch (error) {
			console.log(error);
			throw new HttpException(SCHEDULE_UPDATE_STATUS_ERROR, HttpStatus.BAD_REQUEST);
		}
	}

	private async checkId(id: string): Promise<void> {
		let service: ScheduleModel;
		try {
			service = await this.scheduleService.findById(id);
		} catch (error) {
			console.log(error);
		}
		if (!service) {
			throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
	}
}
