import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ScheduleDocument,
    ScheduleModel,
} from './schedule.model/schedule.model';
import { ScheduleStatus } from './schedule.types';
import { Model } from 'mongoose';
import { ScheduleDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {

    constructor(
        @InjectModel(ScheduleModel.name)
        private scheduleModel: Model<ScheduleDocument>,
    ) {}

    async create(dto: ScheduleDto) {
        return await this.scheduleModel.create(dto).catch(() => {
            return null;
        });
    }

    async checkRoom(dto: ScheduleDto) {
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);

        return this.scheduleModel
            .findOne({
                roomId: dto.roomId,
                status: { $lt: ScheduleStatus.Canceled },
                $or: [
                    {
                        startAt: { $gte: startAt },
                        $and: [
                            { startAt: { $lte: endAt } },
                            { endAt: { $gte: endAt } },
                        ],
                    },
                    {
                        startAt: { $lte: startAt },
                        endAt: { $gte: endAt },
                    },
                    {
                        startAt: { $gte: startAt },
                        endAt: { $lte: endAt },
                    },
                    {
                        $and: [
                            { startAt: { $lte: startAt } },
                            { endAt: { $gte: startAt } },
                        ],
                        endAt: { $lte: endAt },
                    },
                ],
            })
            .exec();
    }

    async findById(id: string): Promise<ScheduleModel> {
        return this.scheduleModel
            .findById(id)
            .exec()
            .catch(() => {
                return null;
            });
    }

    async update(id: string, dto: ScheduleDto) {
        return this.scheduleModel.updateOne({ _id: id }, dto);
    }

    async changeStatus(id: string, status: ScheduleStatus) {
        return this.scheduleModel.updateOne({ _id: id }, { status });
    }

    async hardDelete(id: string) {
        return this.scheduleModel.deleteOne({ _id: id });
    }
}
