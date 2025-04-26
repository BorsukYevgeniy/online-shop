import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { AuthRequest } from '../../types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGuard.name);

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
    const accessToken: string = req.cookies.accessToken;

    if (!accessToken) {
      this.logger.warn('Access token is missing in cookies');
      throw new UnauthorizedException('Access token is missing in cookies');
    }

    try {
      const { id, role } =
        await this.tokenService.verifyAccessToken(accessToken);
      req.user = { id, role };

      this.logger.log(`User authenticated: ${id}, Role: ${role}`);
      return true;
    } catch (e: unknown) {
      this.logger.error('Invalid access token', e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
