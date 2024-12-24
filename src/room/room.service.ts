import { Injectable } from '@nestjs/common';
import { RoomDocument, RoomModel } from './room.model/room.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create.room.dto';
import { ScheduleDocument, ScheduleModel } from '../schedule/schedule.model/schedule.model';
import { ScheduleStatus } from '../schedule/schedule.types';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(RoomModel.name)
        private readonly roomModel: Model<RoomDocument>,

        @InjectModel(ScheduleModel.name)
        private readonly scheduleModel: Model<ScheduleDocument>
    ) {
    }

    async create(dto: CreateRoomDto) {
        return this.roomModel.create(dto);
    }

    async getAll(): Promise<RoomModel[]> {
        return this.roomModel.find().exec();
    }

    async findById(id: string){
        return this.roomModel
            .findById( id ).exec();
    }

    async update(id: string, dto: UpdateRoomDto) {
        return this.roomModel
            .updateOne({ _id: id }, { $set: dto })
            .exec();
    }

    async delete(id: string){
        const deleted =  await this.roomModel
            .updateOne(
                { _id: id },
                { $set: { isDeleted: true } },
            )
            .exec();
        if (deleted) {
            await this.scheduleModel.updateMany(
                { roomId: id },
                { status: ScheduleStatus.Deleted }
            ).exec();
        }
        return deleted;
    }
}
