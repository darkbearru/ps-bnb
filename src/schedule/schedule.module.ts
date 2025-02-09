import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModel, ScheduleSchema } from './schedule.model/schedule.model';
import { RoomService } from '../room/room.service';
import { RoomModel, RoomSchema } from '../room/room.model/room.model';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
	controllers: [ScheduleController],
	imports: [
		MongooseModule.forFeature([
			{
				name: ScheduleModel.name,
				schema: ScheduleSchema,
				collection: 'Schedule',
			},
		]),
		MongooseModule.forFeature([
			{
				name: RoomModel.name,
				schema: RoomSchema,
				collection: 'Room',
			},
		]),
		TelegramModule,
	],
	providers: [ScheduleService, RoomService],
})
export class ScheduleModule {}
