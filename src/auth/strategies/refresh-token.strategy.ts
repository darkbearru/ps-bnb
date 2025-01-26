import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../types/jwt.types';
import * as process from 'node:process';

export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env?.JWT_REFRESH_SECRET,
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
