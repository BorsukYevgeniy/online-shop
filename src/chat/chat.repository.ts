import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserChats(userId: number) {
    const chats = await this.prisma.chat.findMany({
      where: {
        users: { some: { id: userId } },
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return chats.map(chat => ({
      id: chat.id,
      withWhom: chat.users.find(user => user.id !== userId)?.nickname || 'Невідомо'
    }));

  }

  async getChatById(id: number) {
    return await this.prisma.chat.findUnique({
      where: { id },
      select: {
        id: true,
        messages: {
          select: {
            userId: true,
            id: true,
            text: true,
            chatId: true,
            user: { select: { nickname: true } },
          },
        },
      },
    });
  }

  
  async createChat(createDto: CreateChatDto) {
    return await this.prisma.chat.create({
      data: {
        users: {
          connect: [{ id: +createDto.buyerId }, { id: +createDto.sellerId }],
        },
      },
    });
  }
}
