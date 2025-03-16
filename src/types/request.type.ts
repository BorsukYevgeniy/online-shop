import { Request } from 'express';
import Role from '../enum/role.enum';

type AuthRequest = Request & { user?: { id: number; role: Role } }

export default AuthRequest