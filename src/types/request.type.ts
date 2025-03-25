import { Request } from 'express';
import { Role } from '../enum/role.enum';

export type AuthRequest = Request & { user?: { id: number; role: Role } };
