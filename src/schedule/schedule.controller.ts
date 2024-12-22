import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
    SCHEDULE_CREATE_ERROR,
    SCHEDULE_NOT_FOUND,
    SCHEDULE_STATUS_ERROR,
    SCHEDULE_UPDATE_ERROR,
} from './schedule.constants';
import { ScheduleStatus } from './schedule.types';
import { ScheduleDto } from './dto/schedule.dto';

@Controller('schedule')
export class ScheduleController {

    constructor(private readonly scheduleService: ScheduleService) {}

    @UsePipes(new ValidationPipe())
    @Post('create')
    async create(@Body() dto: ScheduleDto) {
        const check = await this.scheduleService.checkRoom(dto);
        if (check) {
            throw new HttpException(SCHEDULE_CREATE_ERROR, HttpStatus.BAD_REQUEST);
        }
        dto.status = ScheduleStatus.Pending;
        const added = await this.scheduleService.create(dto);
        if (!added) {
            throw new HttpException(SCHEDULE_CREATE_ERROR, HttpStatus.BAD_REQUEST);
        }
        return added;
    }

    @UsePipes(new ValidationPipe())
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: ScheduleDto) {
        await this.checkId(id);
        dto.status = ScheduleStatus.Pending;
        const result = await this.scheduleService.update(id, dto);
        if (!result) {
            throw new HttpException(SCHEDULE_UPDATE_ERROR, HttpStatus.BAD_REQUEST);
        }
        return result;
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.checkId(id);
        return this.scheduleService.changeStatus(id, ScheduleStatus.Deleted);
    }

    @Delete('/delete/:id')
    async hardDelete(@Param('id') id: string) {
        await this.checkId(id);
        return this.scheduleService.hardDelete(id);
    }

    @Patch('updateStatus/:id/:status')
    async updateStatus(
        @Param('id') id: string,
        @Param('status') status: number
    ) {
        await this.checkId(id);
        if (!(status in Object.values(ScheduleStatus))) {
            throw new HttpException(SCHEDULE_STATUS_ERROR, HttpStatus.BAD_REQUEST);
        }
        return this.scheduleService.changeStatus(id, status );
    }

    private async checkId(id: string): Promise<void> {
        const service = await this.scheduleService.findById(id);
        if (!service) {
            throw new HttpException(SCHEDULE_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }


}
