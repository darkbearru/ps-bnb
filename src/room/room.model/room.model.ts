import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoomTypes } from '../room.types';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<RoomModel>;

export class RoomImages {
	@Prop()
	name: string;

	@Prop()
	url: string;
}
@Schema({ timestamps: true, _id: true })
export class RoomModel {
	@Prop()
	num: number;

	@Prop({ enum: RoomTypes })
	type: RoomTypes;

	@Prop()
	name: string;

	@Prop()
	square: number;

	@Prop()
	description: string;

	@Prop([String])
	amenities: string[];

	@Prop()
	isDeleted: boolean;

	@Prop({ type: () => [RoomImages], _id: false })
	images: RoomImages[];
}

export const RoomSchema = SchemaFactory.createForClass(RoomModel);
