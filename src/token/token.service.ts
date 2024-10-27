import { Injectable } from '@nestjs/common';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Token } from '@prisma/client';

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

  async generateTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken: string = await this.jwtService.signAsync(
      { userId },
      { expiresIn: '1h', secret: this.accessSecret },
    );

    const refreshToken: string = await this.jwtService.signAsync(
      { userId },
      { expiresIn: '1d', secret: this.refreshSecret },
    );

    await this.tokenRepositry.create(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<{ userId: number }> {
    return await this.jwtService.verifyAsync<{ userId: number }>(refreshToken, {
      secret: this.refreshSecret,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<{ userId: number }> {
    return await this.jwtService.verifyAsync<{ userId: number }>(accessToken, {
      secret: this.accessSecret,
    });
  }

  async getUserTokens(userId: number): Promise<Token[] | null> {
    return await this.tokenRepositry.findUserTokens(userId);
  }
}
