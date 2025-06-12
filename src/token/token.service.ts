import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Token } from '@prisma/client';
import { TokenPayload, Tokens } from './interface/token.interfaces';
import { DeletingCount } from '../types/deleting-count.type';
import { Role } from '../enum/role.enum';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  private readonly accessTokenExpirationTime: string;
  private readonly refreshTokenExpirationTime: string;

  private readonly logger: Logger = new Logger(TokenService.name);

  constructor(
    private readonly tokenRepositry: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    this.accessTokenExpirationTime = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRATION_TIME',
    );
    this.refreshTokenExpirationTime = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION_TIME',
    );
  }

  async generateTokens(tokenPayload: TokenPayload): Promise<Tokens> {
    try {
      const accessToken: string = await this.jwtService.signAsync(
        tokenPayload,
        {
          expiresIn: this.accessTokenExpirationTime,
          secret: this.accessSecret,
        },
      );

      const refreshToken: string = await this.jwtService.signAsync(
        tokenPayload,
        {
          expiresIn: this.refreshTokenExpirationTime,
          secret: this.refreshSecret,
        },
      );

      await this.saveToken(tokenPayload.id, refreshToken);

      this.logger.log(`Generated tokens for user ${tokenPayload.id}`);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error generating tokens', { message: error.message });
      throw new UnauthorizedException('Error generating tokens');
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch (error) {
      this.logger.warn('Invalid refresh token', { message: error.message });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(accessToken, {
        secret: this.accessSecret,
      });
    } catch (error) {
      this.logger.warn('Invalid access token', { message: error.message });
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async getUserTokens(userId: number): Promise<Token[] | null> {
    this.logger.log(`Fetching tokens for user ${userId}`);
    return await this.tokenRepositry.findUserTokens(userId);
  }

  async deleteUserToken(token: string): Promise<DeletingCount> {
    this.logger.log(`Deleting token`);
    return await this.tokenRepositry.deleteUserToken(token);
  }

  async deleteAllUsersTokens(userId: number): Promise<DeletingCount> {
    this.logger.log(`Deleting all tokens for user ${userId}`);
    return await this.tokenRepositry.deleteAllUsersTokens(userId);
  }

  private async saveToken(
    userId: number,
    refreshToken: string,
  ): Promise<Token> {
    const expiredAt: Date = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    try {
      this.logger.log(`Saving token for user ${userId}`);
      return await this.tokenRepositry.create(userId, refreshToken, expiredAt);
    } catch (error) {
      this.logger.error('Error saving token', { message: error.message });
      throw new InternalServerErrorException('Failed to save token');
    }
  }
}
