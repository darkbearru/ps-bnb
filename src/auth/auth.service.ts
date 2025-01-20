import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload, JwtResponse, JwtTokens } from '../types/jwt.types';
import {
	AUTH_NO_ACCESS_ERROR,
	AUTH_NOT_FOUND_ERROR,
	AUTH_WRONG_PASSWORD_ERROR,
} from './auth.constants';
import { compare } from 'bcryptjs';
import { UserDocument } from '../users/user.model/user.model';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterUserDto) {
		const user = await this.usersService.create(dto);
		return this.makeTokensAndPayload(user);
	}

	async login(email: string, password: string) {
		const payload: JwtPayload = await this.validateUser(email, password);
		return this.makeTokensAndPayload(payload);
	}

	async logout(id: string): Promise<boolean> {
		await this.usersService.update(id, { refreshToken: undefined });
		return true;
	}

	async refresh(id: string, refreshToken: string) {
		const user = await this.usersService.findById(id);
		if (!user || !user.refreshToken) throw new ForbiddenException(AUTH_NO_ACCESS_ERROR);

		const isCorrectToken = await compare(refreshToken, user.refreshToken);
		if (!isCorrectToken) throw new ForbiddenException(AUTH_NO_ACCESS_ERROR);

		return this.makeTokensAndPayload(user);
	}

	async delete(id: string): Promise<void> {
		try {
			await this.usersService.delete(id);
		} catch (e) {
			console.error(e);
		}
	}

	private async makeTokensAndPayload(user: UserDocument | JwtPayload): Promise<JwtResponse> {
		let payload: JwtPayload;
		if ((user as UserDocument)?.passwordHash) {
			payload = this.makePayload(user as UserDocument);
		} else {
			payload = user as JwtPayload;
		}
		const tokens = await this.getTokens(payload);
		await this.usersService.updateRefreshToken(payload, tokens.refreshToken);

		return { ...tokens, user: payload };
	}

	private async validateUser(login: string, password: string): Promise<JwtPayload> {
		const user = await this.usersService.findByEmail(login);
		if (!user) {
			throw new NotFoundException(AUTH_NOT_FOUND_ERROR);
		}

		const isCorrectPassword = await compare(password, user.passwordHash);
		if (!isCorrectPassword) {
			throw new ForbiddenException(AUTH_WRONG_PASSWORD_ERROR);
		}

		return this.makePayload(user);
	}

	private makePayload(user: UserDocument): JwtPayload {
		const { id, name, phone, role } = user;
		return { id, name, phone, role };
	}

	private async getTokens(payload: JwtPayload): Promise<JwtTokens> {
		const [accessToken, refreshToken] = await Promise.all([
			this.getAccessToken(payload),
			this.getRefreshToken(payload),
		]);
		return {
			accessToken,
			refreshToken,
		};
	}

	private async getAccessToken(payload: JwtPayload) {
		return this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES'),
		});
	}

	private async getRefreshToken(payload: JwtPayload) {
		return this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
		});
	}
}
