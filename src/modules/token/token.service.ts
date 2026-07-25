import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { TokenRepository } from './token.repository';

import { Token } from '@prisma/client';
import { DeletingCount } from '../../common/types/deleting-count.type';
import { TokenPayload, Tokens } from './interface/token.interfaces';

import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { TokenErrorMessages as TokenErrMsg } from './enum/token-error-messages.enum';

@Injectable()
export class TokenService {
  private readonly logger: Logger = new Logger(TokenService.name);

  constructor(
    private readonly tokenRepositry: TokenRepository,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async generateTokens(tokenPayload: TokenPayload): Promise<Tokens> {
    try {
      const accessToken: string = await this.generateAccessToken(tokenPayload);
      const refreshToken: string =
        await this.generateRefreshToken(tokenPayload);

      await this.saveToken(tokenPayload.id, refreshToken);

      this.logger.log(`Generated tokens for user ${tokenPayload.id}`);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error generating tokens', {
        message: (error as Error).message,
      });
      throw new UnauthorizedException(TokenErrMsg.ErrorGeneratingToken);
    }
  }

  async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch (error) {
      this.logger.warn('Invalid refresh token', {
        message: (error as Error).message,
      });
      throw new UnauthorizedException(TokenErrMsg.RefreshTokenIsMissing);
    }
  }

  async verifyAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(accessToken, {
        secret: this.config.jwtAccessTokenSecret,
      });
    } catch (error) {
      this.logger.warn('Invalid access token', {
        message: (error as Error).message,
      });
      throw new UnauthorizedException(TokenErrMsg.InvalidAccessToken);
    }
  }

  async getUserTokens(userId: number): Promise<Token[] | null> {
    this.logger.log(`Fetching tokens for user ${userId}`);
    return await this.tokenRepositry.findUserTokens(userId);
  }

  async deleteUserToken(token: string): Promise<Token> {
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
      this.logger.error('Error saving token', {
        message: (error as Error).message,
      });
      throw new InternalServerErrorException(TokenErrMsg.FailTokenSave);
    }
  }

  private async generateAccessToken(payload: TokenPayload) {
    this.logger.log(`Generating access token for user ${payload.id}`);

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.config.jwtAccessTokenExpirationTime,
      secret: this.config.jwtAccessTokenSecret,
    } as JwtSignOptions);
  }

  private async generateRefreshToken(payload: TokenPayload) {
    this.logger.log(`Generating refresh token for user ${payload.id}`);

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.config.jwtRefreshTokenExpirationTime,
      secret: this.config.jwtRefreshSecret,
    } as JwtSignOptions);
  }

  async updateTokens(refreshToken: string): Promise<Tokens> {
    const { id, isVerified, role } =
      await this.verifyRefreshToken(refreshToken);

    const newRefreshToken = await this.generateRefreshToken({
      id,
      role,
      isVerified,
    });

    const newAccessToken = await this.generateAccessToken({
      id,
      role,
      isVerified,
    });

    await this.tokenRepositry.update(
      refreshToken,
      newRefreshToken,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    this.logger.log(`Refresh token for user ${id} updated succesfully`);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
