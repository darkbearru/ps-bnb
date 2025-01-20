import { UserRole } from '../users/users.roles';

export type JwtPayload = {
	id: string;
	name: string;
	phone: string;
	role: UserRole;
};

export type JwtTokens = {
	accessToken: string;
	refreshToken: string;
};

export type JwtResponse = JwtTokens & { user: JwtPayload };
