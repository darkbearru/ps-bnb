import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [ScheduleModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
