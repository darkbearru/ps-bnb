import { Injectable } from '@nestjs/common';
import { RoomDocument, RoomModel } from './room.model/room.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomDto } from './dto/room.dto';
import { ScheduleDocument, ScheduleModel } from '../schedule/schedule.model/schedule.model';
import { ScheduleStatus } from '../schedule/schedule.types';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(RoomModel.name)
        private readonly roomModel: Model<RoomDocument>,

        @InjectModel(ScheduleModel.name)
        private readonly scheduleModel: Model<ScheduleDocument>
    ) {
    }

    async create(dto: RoomDto) {
        return this.roomModel
            .create(dto)
            .catch( () => { return null; });
    }

    async getAll(): Promise<RoomModel[]> {
        return this.roomModel.find().exec();
    }

    async findById(id: string){
        return this.roomModel
            .findById( id ).exec()
            .catch( () => { return null; });
    }

    async update(id: string, dto: RoomDto) {
        return this.roomModel.updateOne({ _id: id }, { $set: dto }).exec();
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
