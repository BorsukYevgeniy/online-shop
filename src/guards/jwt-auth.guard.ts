import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from '../token/tokens.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessToken: string = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing in cookies');
    }

    try {
      const { id, roles } =
        await this.tokenService.verifyAccessToken(accessToken);
      req.user = { id, roles };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
