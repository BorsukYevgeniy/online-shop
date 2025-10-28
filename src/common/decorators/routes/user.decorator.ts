import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../../types/request.type';
import { TokenPayload } from '../../../modules/token/interface/token.interfaces';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenPayload => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    return req.user;
  },
);
