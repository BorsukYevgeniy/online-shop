import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/requiered-roles.decorator';
import { TokenService } from '../../token/token.service';
import { AuthRequest } from '../../types/request.type';
import { Role } from '../../enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RolesGuard.name);

  constructor(
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRole: Role = this.reflector.getAllAndOverride<Role>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRole) {
        return true;
      }
      const req: AuthRequest = context.switchToHttp().getRequest<AuthRequest>();
      const accessToken: string = req.cookies.accessToken;

      if (!accessToken) {
        this.logger.warn('Access token is missing in cookies');
        throw new UnauthorizedException('Access token is missing in cookies');
      }

      const { id, role: userRole } =
        await this.tokenService.verifyAccessToken(accessToken);

      req.user = { id, role: userRole };

      if (requiredRole === userRole) {
        this.logger.log(`User authenticated: ${id}, Role: ${userRole}`);
        return true;
      }

      this.logger.warn(
        `User role ${userRole} does not match required role ${requiredRole}`,
      );
      return false;
    } catch (e: unknown) {
      this.logger.error('Invalid access token', e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
