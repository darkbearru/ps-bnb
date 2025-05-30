import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleDocument, ScheduleModel } from './schedule.model/schedule.model';
import { ScheduleStatus } from './schedule.types';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { RoomService } from '../room/room.service';
import { TelegramService } from '../telegram/telegram.service';
import { JwtPayload } from '../types/jwt.types';

@Injectable()
export class ScheduleService {
	constructor(
		@InjectModel(ScheduleModel.name)
		private scheduleModel: Model<ScheduleDocument>,
		private readonly roomService: RoomService,
		private readonly telegramService: TelegramService,
	) {}

	async create(dto: CreateScheduleDto, userId: string): Promise<ScheduleModel> {
		return await this.scheduleModel.create({
			...dto,
			userId,
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
					$and: [{ startAt: { $lte: start } }, { endAt: { $gte: end } }],
				},
				{
					$and: [{ startAt: { $gte: start } }, { endAt: { $lte: end } }],
				},
				{
					$and: [
						{ startAt: { $lte: start } },
						{ endAt: { $gte: start } },
						{ endAt: { $lte: end } },
					],
				},
			],
		};
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

	async hardDelete(id: string) {
		return this.scheduleModel.deleteOne({ _id: id });
	}

	async notification(payload: JwtPayload, dto: CreateScheduleDto): Promise<void> {
		const room = await this.roomService.findById(dto.roomId);
		if (!room) return;
		console.log('room', room);
		const message: string =
			`Забронирована комната: ${room.name}\n` +
			`c ${dto.startAt} по ${dto.endAt}\n` +
			`Клиент: ${payload.name} (${payload.phone})\n`;
		return this.telegramService.sendMessage(message);
	}
}
