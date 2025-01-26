import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import {
	AUTH_NAME_ERROR,
	AUTH_PASSWORD_ERROR,
	AUTH_PASSWORD_MIN_ERROR,
	AUTH_PHONE_ERROR,
	AUTH_WRONG_EMAIL_ERROR,
} from '../auth.constants';

export class RegisterUserDto {
	@IsEmail({}, { message: AUTH_WRONG_EMAIL_ERROR })
	email: string;

	@IsString({ message: AUTH_PASSWORD_ERROR })
	@MinLength(5, { message: AUTH_PASSWORD_MIN_ERROR })
	password: string;

	@IsString({ message: AUTH_NAME_ERROR })
	name: string;

	@IsPhoneNumber(undefined, { message: AUTH_PHONE_ERROR })
	phone: string;
}
