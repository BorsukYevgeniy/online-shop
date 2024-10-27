import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessToken: string = req.cookies.accessToken

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing in cookies');
    }

    try {
      const {userId: id} = await this.tokenService.verifyAccessToken(accessToken);
      req.user = {id};
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
