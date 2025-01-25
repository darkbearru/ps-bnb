import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload, JwtResponse } from '../types/jwt.types';
import { LoginUserDto } from './dto/login-user.dto';
import { Request } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserPayload } from '../decorators/user-payload.decorator';
import { AUTH_BAD_REQUEST_ERROR } from './auth.constants';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../decorators/auth-roles.decorator';
import { UserRole } from '../users/users.roles';
import { IdValidationPipe } from './pipes/id-validation.pipe';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: RegisterUserDto): Promise<JwtResponse> {
		return await this.authService.register(dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginUserDto): Promise<JwtResponse> {
		return await this.authService.login(dto.email, dto.password);
	}

	@UseGuards(AccessTokenGuard)
	@Get('logout')
	async logout(@UserPayload() payload: JwtPayload) {
		if (!payload) throw new BadRequestException(AUTH_BAD_REQUEST_ERROR);
		await this.authService.logout(payload.id);
		return {
			statusCode: HttpStatus.OK,
		};
	}

	@UseGuards(RefreshTokenGuard)
	@Get('refresh')
	async refresh(@Req() req: Request, @UserPayload() payload: JwtPayload): Promise<JwtResponse> {
		const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
		return this.authService.refresh(payload.id, refreshToken);
	}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Delete('delete/:id')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return this.authService.delete(id);
	}
}
