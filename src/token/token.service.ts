import { Injectable } from '@nestjs/common';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Token } from '@prisma/client';
import { TokenPayload, Tokens } from './interface/token.interfaces';
import { DeletingCount } from 'src/interface/deleting-count.interface';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly tokenRepositry: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  async generateTokens(userId: number, roles: string[]): Promise<Tokens> {
    const accessToken: string = await this.jwtService.signAsync(
      { id: userId, roles },
      { expiresIn: '1h', secret: this.accessSecret },
    );

    const refreshToken: string = await this.jwtService.signAsync(
      { id: userId, roles },
      { expiresIn: '1d', secret: this.refreshSecret },
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

  async deleteUserTokens(token: string): Promise<DeletingCount> {
    return await this.tokenRepositry.deleteUserTokens(token);
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
