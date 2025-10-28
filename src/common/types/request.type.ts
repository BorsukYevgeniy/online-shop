import { Request } from 'express';
import { TokenPayload } from '../../modules/token/interface/token.interfaces';

export type AuthRequest = Request & {
  user?: TokenPayload;
};
