import { Reflector } from '@nestjs/core';
import { Role } from '../../../common/enum/role.enum';

export const RequieredRoles = Reflector.createDecorator<Role>();

