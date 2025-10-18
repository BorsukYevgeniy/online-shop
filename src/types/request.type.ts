import { Request } from 'express';
import { TokenPayload } from '../token/interface/token.interfaces';

export type AuthRequest = Request & {
  user?: TokenPayload;
};
