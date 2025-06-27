import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

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

  async createMessage(createDto: CreateMessageDto) {
    return await this.prisma.message.create({
      data: {
        text: createDto.text,
        chatId: createDto.chatId,
        userId: createDto.userId,
      },

      select: {
        id: true,
        chatId: true,
        text: true,
        userId: true,
        user: { select: { nickname: true } },
      },
    });
  }

  async deleteMessage(messageId: number) {
    return await this.prisma.message.delete({ where: { id: messageId } });
  }

  async updateMessage(messageId: number, updateDto: UpdateMessageDto) {
    return await this.prisma.message.update({
      where: { id: messageId },
      data: { text: updateDto.text },

      select: {
        id: true,
        chatId: true,
        text: true,
        userId: true,
        user: { select: { nickname: true } },
      },
    });
  }

  async getMessagesByChatId(chatId: number) {
    return await this.prisma.message.findMany({ where: { chatId } });
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
