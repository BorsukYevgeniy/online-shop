import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { AuthRequest } from '../../types/request.type';

import { TokenErrorMessages as TokenErrMsg } from '../../token/enum/token-error-messages.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
    const accessToken: string = req.cookies.accessToken;

    if (!accessToken) {
      this.logger.warn('Access token is missing in cookies');
      throw new UnauthorizedException(TokenErrMsg.AccessTokenIsMissing);
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(accessToken);
      req.user = payload;

      this.logger.log(
        `User authenticated: ${payload.id}, Role: ${payload.role}, isVerified: ${payload.isVerified},
      `,
      );
      return true;
    } catch (e: unknown) {
      this.logger.error('Invalid access token', e);
      throw new UnauthorizedException(TokenErrMsg.InvalidAccessToken);
    }
  }
}
