import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ScheduleDocument,
    ScheduleModel,
} from './schedule.model/schedule.model';
import { ScheduleStatus } from './schedule.types';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectModel(ScheduleModel.name)
        private scheduleModel: Model<ScheduleDocument>,
    ) {}

    async create(dto: CreateScheduleDto) {
        return await this.scheduleModel.create({
            ...dto,
            status: ScheduleStatus.Pending,
        });
    }

    async checkRoom(dto: CreateScheduleDto) {
        return this.scheduleModel
            .findOne({
                ...this.makeDateCheckCondition(dto.startAt, dto.endAt),
                roomId: dto.roomId,
                status: { $lt: ScheduleStatus.Canceled },
            })
            .exec();
    }

    private makeDateCheckCondition(startAt: string, endAt: string) {
        const start = new Date(startAt);
        const end = new Date(endAt);
        return {
            $or: [
                {
                    $and: [
                        { startAt: { $gte: start } },
                        { startAt: { $lte: end } },
                        { endAt: { $gte: end } },
                    ],
                },
                {
                    $and: [
                        { startAt: { $lte: start } },
                        { endAt: { $gte: end } },
                    ]
                },
                {
                    $and: [
                        { startAt: { $gte: start } },
                        { endAt: { $lte: end } },
                    ]
                },
                {
                    $and: [
                        { startAt: { $lte: start } },
                        { endAt: { $gte: start } },
                        { endAt: { $lte: end } },
                    ],
                },
            ],
        }
    }

    async findById(id: string): Promise<ScheduleModel> {
        return this.scheduleModel.findById(id).exec();
    }

    async update(id: string, dto: UpdateScheduleDto) {
        const check = await this.scheduleModel
            .findOne({
                _id: { $ne: id },
                ...this.makeDateCheckCondition(dto.startAt, dto.endAt),
                roomId: dto.roomId,
                status: { $lt: ScheduleStatus.Canceled },
            })
            .exec();
        if (check) return;

        return this.scheduleModel.updateOne(
            { _id: id },
            { ...dto, status: ScheduleStatus.Pending },
        );
    }

    async delete(id: string) {
        return this.changeStatus(id, ScheduleStatus.Deleted);
    }

    async changeStatus(id: string, status: ScheduleStatus) {
        return this.scheduleModel.updateOne({ _id: id }, { status });
    }
}
