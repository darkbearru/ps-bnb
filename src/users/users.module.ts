import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.model/user.model';
import { UsersService } from './users.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: UserModel.name,
				schema: UserSchema,
				collection: 'User',
			},
		]),
	],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
