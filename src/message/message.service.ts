import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { Message } from '@prisma/client';
import { MessageNickname } from './types/message.type';

import { MessageErrorMessages as MessageErrMsg } from './enum/message-error-messages.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async getMessageById(messageId: number) {
    const message = await this.messageRepository.getMessageById(messageId);

    if (!message) throw new NotFoundException(MessageErrMsg.MessageNotFound);

    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<MessageNickname[]> {
    return await this.messageRepository.getMessagesByChatId(chatId);
  }

  async createMessage(
    createDto: CreateMessageDto,
    chatId: number,
    userId: number,
  ): Promise<MessageNickname> {
    return await this.messageRepository.createMessage(
      createDto,
      chatId,
      userId,
    );
  }

  async updateMesssage(
    messageId: number,
    updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    try {
      return await this.messageRepository.updateMessage(messageId, updateDto);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(MessageErrMsg.MessageNotFound);
      }
    }
  }

  async deleteMessage(messageId: number): Promise<Message> {
    try {
      return await this.messageRepository.deleteMessage(messageId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(MessageErrMsg.MessageNotFound);
      }
    }
  }
}
