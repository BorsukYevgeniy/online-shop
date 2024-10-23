import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authHeader.split(' ');

    if (!type || type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      req.user = decoded;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
