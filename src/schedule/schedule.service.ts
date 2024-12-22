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

        return this.scheduleModel
            .findOne({
                ...this.makeDateCheckCondition(dto),
                roomId: dto.roomId,
                status: { $lt: ScheduleStatus.Canceled },
            })
            .exec();
    }

    private makeDateCheckCondition(dto: ScheduleDto) {
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);
        return {
            $or: [
                {
                    $and: [
                        { startAt: { $gte: startAt } },
                        { startAt: { $lte: endAt } },
                        { endAt: { $gte: endAt } },
                    ],
                },
                {
                    $and: [
                        { startAt: { $lte: startAt } },
                        { endAt: { $gte: endAt } },
                    ]
                },
                {
                    $and: [
                        { startAt: { $gte: startAt } },
                        { endAt: { $lte: endAt } },
                    ]
                },
                {
                    $and: [
                        { startAt: { $lte: startAt } },
                        { endAt: { $gte: startAt } },
                        { endAt: { $lte: endAt } },
                    ],
                },
            ],
        }
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
        const check = await this.scheduleModel
            .findOne({
                _id: { $ne: id },
                ...this.makeDateCheckCondition(dto),
                roomId: dto.roomId,
                status: { $lt: ScheduleStatus.Canceled },
            })
            .exec();
        if (check) return;
        return this.scheduleModel.updateOne({
            _id: id,
        }, dto);
    }

    async changeStatus(id: string, status: ScheduleStatus) {
        return this.scheduleModel.updateOne({ _id: id }, { status });
    }

    async hardDelete(id: string) {
        return this.scheduleModel.deleteOne({ _id: id });
    }
}
