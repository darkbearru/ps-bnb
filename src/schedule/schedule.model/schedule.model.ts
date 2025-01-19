import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RoomModel } from '../../room/room.model/room.model';
import { ScheduleStatus } from '../schedule.types';

export type ScheduleDocument = HydratedDocument<ScheduleModel>;

@Schema({ _id: true, timestamps: false })
export class ScheduleModel {
	@Prop()
	startAt: Date;

	@Prop()
	endAt: Date;

	@Prop({ enum: ScheduleStatus })
	status: ScheduleStatus;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: RoomModel.name })
	roomId: RoomModel;
}

export const ScheduleSchema = SchemaFactory.createForClass(ScheduleModel);
