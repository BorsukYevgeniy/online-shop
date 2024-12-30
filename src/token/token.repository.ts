import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeletingCount } from 'src/interface/deleting-count.interface';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(userId: number): Promise<Token | null> {
    return await this.prismaService.token.findFirst({
      where: {
        userId,
      },
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

  async findUserTokens(userId: number): Promise<Token[] | null> {
    return await this.prismaService.token.findMany({
      where: { userId },
    });
  }

  async deleteUserTokens(token: string): Promise<DeletingCount> {
    return await this.prismaService.token.deleteMany({ where: { token } });
  }

  async deleteExpiredTokens(now: Date): Promise<DeletingCount> {
    return await this.prismaService.token.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  }
}
