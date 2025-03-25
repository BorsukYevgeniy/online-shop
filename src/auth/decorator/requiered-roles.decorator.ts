import { SetMetadata } from '@nestjs/common';
import { Role } from '../../enum/role.enum';

export const ROLES_KEY: string = 'roles';

export const RequieredRoles = (role: Role) => SetMetadata(ROLES_KEY, role);
