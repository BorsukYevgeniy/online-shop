import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Token } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../modules/token/token.service';
import { TokenErrorMessages as TokenErrMsg } from '../../modules/token/enum/token-error-messages.enum';

/**
 * Middleware for updating access token
 */
@Injectable()
export class TokenSsrMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { accessToken, refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedException(TokenErrMsg.RefreshTokenIsMissing);
    }

    try {
      await this.tokenService.verifyAccessToken(accessToken);
      return next();
    } catch (e: any) {
      if (e instanceof UnauthorizedException) {
        const payload =
          await this.tokenService.verifyRefreshToken(refreshToken);

        const userTokens: Token[] = await this.tokenService.getUserTokens(
          payload.id,
        );
        const validToken = userTokens.some((t) => t.token === refreshToken);
        if (!validToken) {
          throw new UnauthorizedException(TokenErrMsg.InvalidRefreshToken);
        }

        const tokens = await this.tokenService.generateTokens({
          id: payload.id,
          role: payload.role,
          isVerified: payload.isVerified,
        });

        if (!res.headersSent) {
          req.cookies.accessToken = tokens.accessToken;
          req.cookies.refreshToken = tokens.accessToken;

          res.cookie('accessToken', tokens.accessToken, {
            maxAge: 60 * 60 * 1000,
          });
          res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
        }

        return next();
      }

      throw new UnauthorizedException(TokenErrMsg.InvalidAccessToken);
    }
  }
}
