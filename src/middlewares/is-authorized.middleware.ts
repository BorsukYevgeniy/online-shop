import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthRequest } from '../types/request.type';
import { Response, NextFunction } from 'express';

/**
 * Middleware for cheking user auth
 */
@Injectable()
export class IsAuthorizedMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    res.locals.isAuthenticated = !!req.cookies.refreshToken;
    return next();
  }
}
