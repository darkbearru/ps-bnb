import { IsEmail, IsString, MinLength } from 'class-validator';
import {
	AUTH_PASSWORD_ERROR,
	AUTH_PASSWORD_MIN_ERROR,
	AUTH_WRONG_EMAIL_ERROR,
} from '../auth.constants';

export class LoginUserDto {
	@IsEmail({}, { message: AUTH_WRONG_EMAIL_ERROR })
	email: string;

	@IsString({ message: AUTH_PASSWORD_ERROR })
	@MinLength(5, { message: AUTH_PASSWORD_MIN_ERROR })
	password: string;
}
