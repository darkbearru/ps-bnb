import { IsOptional, IsPhoneNumber, IsString, MinLength, ValidateIf } from 'class-validator';
import {
	AUTH_NAME_ERROR,
	AUTH_PASSWORD_ERROR,
	AUTH_PASSWORD_MIN_ERROR,
	AUTH_PHONE_ERROR,
} from '../auth.constants';

export class UpdateUserDto {
	@IsOptional()
	@IsString({ message: AUTH_PASSWORD_ERROR })
	@MinLength(5, { message: AUTH_PASSWORD_MIN_ERROR })
	oldPassword?: string;

	@IsOptional()
	@ValidateIf((o) => typeof o.oldPassword !== undefined)
	@IsString({ message: AUTH_PASSWORD_ERROR })
	@MinLength(5, { message: AUTH_PASSWORD_MIN_ERROR })
	password?: string;

	@IsOptional()
	@IsString({ message: AUTH_NAME_ERROR })
	name?: string;

	@IsOptional()
	@IsPhoneNumber(undefined, { message: AUTH_PHONE_ERROR })
	phone?: string;
}
