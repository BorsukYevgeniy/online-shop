import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles-auth.decorator';
import { TokenService } from '../../token/token.service';
import { AuthRequest } from 'src/interface/express-requests.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles: string[] = this.reflector.getAllAndOverride<
        string[]
      >(ROLES_KEY, [context.getHandler(), context.getClass()]);

      if (!requiredRoles) {
        return true;
      }
      const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
      const accessToken: string = req.cookies.accessToken;

      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing in cookies');
      }

      const { id, roles } =
        await this.tokenService.verifyAccessToken(accessToken);

      req.user = { id, roles };

      return roles.some((role: string): boolean =>
        requiredRoles.includes(role),
      );
    } catch (e: unknown) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
