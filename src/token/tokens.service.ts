import { Injectable } from '@nestjs/common';
import { TokensRepository } from './tokens.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Token } from '@prisma/client';

@Injectable()
export class TokensService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly tokenRepositry: TokensRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  async generateTokens(
    userId: number,
    roles: string[],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken: string = await this.jwtService.signAsync(
      { id: userId, roles },
      { expiresIn: '1h', secret: this.accessSecret },
    );

    const refreshToken: string = await this.jwtService.signAsync(
      { id: userId, roles },
      { expiresIn: '1d', secret: this.refreshSecret },
    );

    await this.tokenRepositry.create(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<{ userId: number; roles: string[] }> {
    return await this.jwtService.verifyAsync<{
      userId: number;
      roles: string[];
    }>(refreshToken, {
      secret: this.refreshSecret,
    });
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<{ id: number; roles: string[] }> {
    return await this.jwtService.verifyAsync<{
      id: number;
      roles: string[];
    }>(accessToken, {
      secret: this.accessSecret,
    });
  }

  async getUserTokens(userId: number): Promise<Token[] | null> {
    return await this.tokenRepositry.findUserTokens(userId);
  }

  async deleteUserTokens(token: string) {
    return await this.tokenRepositry.deleteUserTokens(token);
  }
}
