import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { Message } from '@prisma/client';
import { MessageNickname } from './types/message.type';

import { MessageErrorMessages as MessageErrMsg } from './enum/message-error-messages.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MessageService {
  private readonly logger: Logger = new Logger(MessageService.name);

  constructor(private readonly messageRepository: MessageRepository) {}

  async getMessageById(messageId: number) {
    const message = await this.messageRepository.getMessageById(messageId);

    if (!message) {
      this.logger.warn(`Message with ID ${messageId} not found.`);
      throw new NotFoundException(MessageErrMsg.MessageNotFound);
    }

    this.logger.log(`Fetched message with ID ${messageId}.`);

    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<MessageNickname[]> {
    this.logger.log(`Fetching messages for chat ID ${chatId}.`);

    return await this.messageRepository.getMessagesByChatId(chatId);
  }

  async createMessage(
    createDto: CreateMessageDto,
    chatId: number,
    userId: number,
  ): Promise<MessageNickname> {
    this.logger.log(
      `Creating message in chat ID ${chatId} from user ID ${userId}.`,
    );

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
      this.logger.log(`Updating message with ID ${messageId}.`);

      return await this.messageRepository.updateMessage(messageId, updateDto);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Message with ID ${messageId} not found for update.`);
        throw new NotFoundException(MessageErrMsg.MessageNotFound);
      }
    }
  }

  async deleteMessage(messageId: number): Promise<Message> {
    try {
      this.logger.log(`Deleting message with ID ${messageId}.`);

      return await this.messageRepository.deleteMessage(messageId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(
          `Message with ID ${messageId} not found for deletion.`,
        );

        throw new NotFoundException(MessageErrMsg.MessageNotFound);
      }
    }
  }
}
