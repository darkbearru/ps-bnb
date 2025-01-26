import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../users/users.roles';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles) => SetMetadata(ROLES_KEY, roles);
