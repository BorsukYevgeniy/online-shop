import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../../token/token.service';
import { AuthRequest } from '../../../common/types/request.type';

import { TokenErrorMessages as TokenErrMsg } from '../../token/enum/token-error-messages.enum';
import { RequieredRoles } from '../decorator/requiered-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RolesGuard.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
    const requiredRole = this.reflector.get(RequieredRoles, context.getHandler());

      if (!requiredRole) {
        return true;
      }
      const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
      const accessToken: string = req.cookies.accessToken;

      if (!accessToken) {
        this.logger.warn('Access token is missing in cookies');
        throw new UnauthorizedException(TokenErrMsg.AccessTokenIsMissing);
      }

      const payload = await this.tokenService.verifyAccessToken(accessToken);

      req.user = payload;

      if (requiredRole === payload.role) {
        this.logger.log(
          `User authenticated: ${payload.id}, Role: ${payload.role}, isVerified: ${payload.isVerified},
              `,
        );
        return true;
      }

      this.logger.warn(
        `User role ${payload.role} does not match required role ${requiredRole}`,
      );
      return false;
    } catch (e: unknown) {
      this.logger.error('Invalid access token', e);
      throw new UnauthorizedException(TokenErrMsg.InvalidAccessToken);
    }
  }
}
