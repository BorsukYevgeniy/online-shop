import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeletingCount } from '../types/deleting-count.type';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserTokens(userId: number): Promise<Token[] | null> {
    return await this.prismaService.token.findMany({
      where: { userId },
    });
  }

  async create(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<Token> {
    return await this.prismaService.token.create({
      data: { userId, expiresAt, token: refreshToken },
    });
  }

  async update(
    refreshToken: string,
    newRefreshToken: string,
    newExpirationTime: Date,
  ): Promise<Token> {
    return await this.prismaService.token.update({
      where: { token: refreshToken },
      data: { token: newRefreshToken, expiresAt: newExpirationTime },
    });
  }

  async deleteUserToken(refreshToken: string): Promise<Token> {
    return await this.prismaService.token.delete({
      where: { token: refreshToken },
    });
  }

  async deleteAllUsersTokens(userId: number): Promise<DeletingCount> {
    return await this.prismaService.token.deleteMany({ where: { userId } });
  }

  async deleteExpiredTokens(): Promise<DeletingCount> {
    return await this.prismaService.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
