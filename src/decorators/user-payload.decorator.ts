import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt.types';
import { Request } from 'express';

export const UserPayload = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
		const request: Request = ctx.switchToHttp().getRequest<Request>();
		return request?.user as JwtPayload;
	},
);
