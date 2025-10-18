import { Reflector } from '@nestjs/core';
import { Role } from '../../enum/role.enum';

export const RequieredRoles = Reflector.createDecorator<Role>();

