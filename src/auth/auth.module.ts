import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../users/user.model/user.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: UserModel.name,
				schema: UserSchema,
				collection: 'User',
			},
		]),
		JwtModule.register({}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		ConfigService,
		UsersService,
		AccessTokenStrategy,
		RefreshTokenStrategy,
	],
})
export class AuthModule {}
