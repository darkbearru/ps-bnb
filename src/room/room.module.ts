import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from './room.model/room.model';
import { ScheduleModel, ScheduleSchema } from '../schedule/schedule.model/schedule.model';

@Module({
    controllers: [RoomController],
    imports: [
        MongooseModule.forFeature([
            {
                name: RoomModel.name,
                schema: RoomSchema,
                collection: 'Room',
            },
        ]),
        MongooseModule.forFeature([
            {
                name: ScheduleModel.name,
                schema: ScheduleSchema,
                collection: 'schedule',
            },
        ]),
    ],
    providers: [RoomService]
})
export class RoomModule {}
