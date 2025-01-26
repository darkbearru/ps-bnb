import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../users.roles';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true, _id: true })
export class UserModel {
	@Prop({ unique: true })
	email: string;

	@Prop()
	name: string;

	@Prop()
	passwordHash: string;

	@Prop()
	phone: string;

	@Prop({ enum: UserRole })
	role: UserRole;

	@Prop()
	refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
