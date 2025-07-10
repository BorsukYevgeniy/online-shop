import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ChatMemberValidationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersInChat(chatId: number) {
    return await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}
