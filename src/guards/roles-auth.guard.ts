import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles-auth.decorator';
import { TokensService } from '../token/tokens.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private tokenService: TokensService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const req = context.switchToHttp().getRequest();
      const accessToken: string = req.cookies.accessToken;

      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing in cookies');
      }

      const { id, roles } =
        await this.tokenService.verifyAccessToken(accessToken);
      req.user = { id, roles };
      return roles.some((role) => requiredRoles.includes(role));
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
