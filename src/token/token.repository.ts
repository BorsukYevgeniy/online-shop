import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeletingCount } from 'src/interface/deleting-count.interface';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(userId: number): Promise<Token | null> {
    const token = await this.prismaService.token.findFirst({
      where: {
        userId,
      },
    });
    return token;
  }

  async create(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<Token> {
    const token: Token = await this.prismaService.token.create({
      data: { userId, expiresAt, token: refreshToken },
    });

    return token;
  }

  async findUserTokens(userId: number): Promise<Token[] | null> {
    const tokens: Token[] = await this.prismaService.token.findMany({
      where: { userId },
    });

    return tokens;
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
