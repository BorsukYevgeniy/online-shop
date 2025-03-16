import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import AuthRequest  from '../../types/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
    const accessToken: string = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing in cookies');
    }

    try {
      const { id, role } =
        await this.tokenService.verifyAccessToken(accessToken);
      req.user = { id, role };
      
      return true;
    } catch (e: unknown) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
