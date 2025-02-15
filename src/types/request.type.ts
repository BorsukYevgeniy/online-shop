import { Request } from 'express';

export type AuthRequest = Request & { user?: { id: number; roles: string[] } };
