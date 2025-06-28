import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { Message } from '@prisma/client';
import { MessageNickname } from './types/message.type';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return await this.messageRepository.getMessagesByChatId(chatId);
  }

  async createMessage(createDto: CreateMessageDto): Promise<MessageNickname> {
    return await this.messageRepository.createMessage(createDto);
  }

  async updateMesssage(
    messageId: number,
    updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageRepository.updateMessage(messageId, updateDto);
  }

  async deleteMessage(messageId: number): Promise<Message> {
    return await this.messageRepository.deleteMessage(messageId);
  }
}
