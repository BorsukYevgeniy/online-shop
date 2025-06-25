import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getChatById(id: number) {
    return await this.prisma.chat.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  async createMessage(createDto: CreateMessageDto) {
    return await this.prisma.message.create({
      data: {
        text: createDto.text,
        chatId: createDto.chatId,
        userId: createDto.userId,
      },
    });
  }


  async getMessagesByChatId(chatId:number){
    return await this.prisma.message.findMany({where: {chatId}})
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
