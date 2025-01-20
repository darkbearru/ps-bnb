import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './user.model/user.model';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { USER_BAD_DATA_ERROR, USER_EXISTS_ERROR } from './users.constants';
import { genSalt, hash } from 'bcryptjs';
import { UserRole } from './users.roles';
import { JwtPayload } from '../types/jwt.types';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(UserModel.name)
		private readonly userModel: Model<UserDocument>,
	) {}

	async create(dto: RegisterUserDto) {
		if (await this.findByEmail(dto.email)) {
			throw new BadRequestException(USER_EXISTS_ERROR);
		}
		try {
			const salt = await genSalt(10);
			const newUser = new this.userModel({
				email: dto.email,
				passwordHash: await hash(dto.password, salt),
				name: dto.name,
				phone: dto.phone,
				role: UserRole.USER,
			});
			return await newUser.save();
		} catch (error) {
			console.error(error);
			throw new BadRequestException(USER_BAD_DATA_ERROR);
		}
	}

	async update(id: string, dto: Omit<UpdateUserDto, 'oldPassword'> | { refreshToken: string }) {
		try {
			return this.userModel.findByIdAndUpdate(id, dto);
		} catch (error) {
			console.error(error);
			throw new BadRequestException(USER_BAD_DATA_ERROR);
		}
	}

	async findById(id: string): Promise<UserDocument> {
		return this.userModel.findById(id);
	}

	async findByEmail(email: string): Promise<UserDocument> {
		return this.userModel.findOne({ email });
	}

	async delete(id: string): Promise<UserDocument> {
		return this.userModel.findByIdAndDelete(id);
	}

	async updateRefreshToken(payload: JwtPayload, refreshToken: string): Promise<void> {
		const salt = await genSalt(10);
		const refreshTokenHash = await hash(refreshToken, salt);
		await this.userModel.findByIdAndUpdate(payload.id, {
			refreshToken: refreshTokenHash,
		});
	}
}
