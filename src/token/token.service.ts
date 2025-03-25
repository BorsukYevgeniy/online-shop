import { Injectable } from '@nestjs/common';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Token } from '@prisma/client';
import { TokenPayload, Tokens } from './interface/token.interfaces';
import {DeletingCount} from '../types/deleting-count.type';
import {Role} from '../enum/role.enum';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  private readonly accessTokenExpirationTime: string;
  private readonly refreshTokenExpirationTime: string;

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

  async generateTokens(userId: number, role: Role): Promise<Tokens> {
    const accessToken: string = await this.jwtService.signAsync(
      { id: userId, role },
      { expiresIn: this.accessTokenExpirationTime, secret: this.accessSecret },
    );

    const refreshToken: string = await this.jwtService.signAsync(
      { id: userId, role },
      {
        expiresIn: this.refreshTokenExpirationTime,
        secret: this.refreshSecret,
      },
    );

    await this.saveToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    return await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
      secret: this.refreshSecret,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    return await this.jwtService.verifyAsync<TokenPayload>(accessToken, {
      secret: this.accessSecret,
    });
  }

  async getUserTokens(userId: number): Promise<Token[] | null> {
    return await this.tokenRepositry.findUserTokens(userId);
  }

  async deleteUserToken(token: string): Promise<DeletingCount> {
    return await this.tokenRepositry.deleteUserToken(token);
  }

  async deleteAllUsersTokens(userId: number): Promise<DeletingCount> {
    return await this.tokenRepositry.deleteAllUsersTokens(userId);
  }

  private async saveToken(
    userId: number,
    refreshToken: string,
  ): Promise<Token> {
    const expiredAt: Date = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    return await this.tokenRepositry.create(userId, refreshToken, expiredAt);
  }
}
