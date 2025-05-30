import { Injectable } from '@nestjs/common';
import { RoomDocument, RoomModel } from './room.model/room.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { ScheduleDocument, ScheduleModel } from '../schedule/schedule.model/schedule.model';
import { ScheduleStatus } from '../schedule/schedule.types';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
	constructor(
		@InjectModel(RoomModel.name)
		private readonly roomModel: Model<RoomDocument>,

		@InjectModel(ScheduleModel.name)
		private readonly scheduleModel: Model<ScheduleDocument>,
	) {}

	async create(dto: CreateRoomDto) {
		return this.roomModel.create(dto);
	}

	async getAll(): Promise<RoomModel[]> {
		return this.roomModel.find().exec();
	}

	async findById(id: string) {
		const result = await this.roomModel.find({ _id: id, isDeleted: null }).exec();
		if (!result || result.length === 0) return undefined;
		return result?.[0];
	}

	async update(id: string, dto: UpdateRoomDto) {
		return this.roomModel.updateOne({ _id: id }, { $set: dto }).exec();
	}

	async delete(id: string) {
		const deleted = await this.roomModel
			.updateOne({ _id: id }, { $set: { isDeleted: true } })
			.exec();
		if (deleted) {
			await this.scheduleModel
				.updateMany({ roomId: id }, { status: ScheduleStatus.Deleted })
				.exec();
		}
		return deleted;
	}

	async hardDelete(id: string) {
		const deleted = await this.roomModel.deleteOne({ _id: id }).exec();
		if (deleted) {
			await this.scheduleModel.deleteMany({ roomId: id }).exec();
		}
		return deleted;
	}

	async getStats(month: number, year: number) {
		const range = this.getDateRange(month, year);
		return this.scheduleModel
			.aggregate()
			.match({
				$and: [{ startAt: { $gt: range.start } }, { startAt: { $lte: range.end } }],
				status: { $eq: ScheduleStatus.Completed },
			})
			.lookup({
				from: 'Room',
				localField: 'roomId',
				foreignField: '_id',
				as: 'rooms',
			})
			.unwind('rooms')
			.group({
				_id: '$rooms._id',
				roomName: { $first: '$rooms.name' },
				bookingCount: { $sum: 1 },
			})
			.sort({
				roomName: 1,
			});
	}

	private getDateRange(month: number, year: number) {
		return {
			start: new Date(year, month, 1, 0, 0),
			end: new Date(year, month + 1, 0, 0, 0),
		};
	}
}
