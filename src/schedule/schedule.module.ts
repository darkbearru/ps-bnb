import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModel, ScheduleSchema } from './schedule.model/schedule.model';

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
	],
	providers: [ScheduleService],
})
export class ScheduleModule {}
