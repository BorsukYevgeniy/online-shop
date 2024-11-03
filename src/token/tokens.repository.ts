import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokensRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(userId: number): Promise<Token | null> {
    const token = await this.prismaService.token.findFirst({
      where: {
        userId,
      },
    });
    return token;
  }

  async create(userId: number, refreshToken: string): Promise<Token> {
    const token: Token = await this.prismaService.token.create({
      data: { userId, token: refreshToken },
    });

    return token;
  }

  async findUserTokens(userId: number): Promise<Token[] | null> {
    const tokens: Token[] = await this.prismaService.token.findMany({
      where: { userId },
    });

    return tokens;
  }

  async deleteUserTokens(token: string) {
    return await this.prismaService.token.deleteMany({ where: { token } });
  }
}
