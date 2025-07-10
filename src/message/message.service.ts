import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { Message } from '@prisma/client';
import { MessageNickname } from './types/message.type';

import { MessageErrorMessages as MessageErrMsg } from './enum/message-error-messages.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatMemberValidationService } from '../chat-message/chat-member-validation.service';

@Injectable()
export class MessageService {
  private readonly logger: Logger = new Logger(MessageService.name);

  constructor(private readonly messageRepository: MessageRepository,
    private readonly validationService: ChatMemberValidationService,
  ) {}


  async getMessageById(messageId: number, userId: number) {
    await this.validateMessageOwnership(messageId, userId);

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
    await this.validationService.validateChatMembers(chatId, userId)

    this.logger.log(
      `Creating message in chat ID ${chatId} from user ID ${userId}.`,
    );

    return await this.messageRepository.createMessage(
      createDto,
      chatId,
      userId,
    );
  }

  async updateMessage(
    messageId: number,
    userId: number,
    updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    await this.validateMessageOwnership(messageId, userId);

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

  async deleteMessage(messageId: number, userId: number): Promise<Message> {
    await this.validateMessageOwnership(messageId, userId);
    
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

  private async validateMessageOwnership(
    messageId: number,
    userId: number,
  ): Promise<boolean> {    
    this.logger.log(
      `Validating ownership of message ID ${messageId} for user ID ${userId}.`,
    );

    const message = await this.messageRepository.getMessageById(messageId);


    if (!message) {
      this.logger.warn(`Message with ID ${messageId} not found.`);
      throw new NotFoundException(MessageErrMsg.MessageNotFound);
    }

    if (message.userId !== userId) {
      this.logger.warn(
        `User with ID ${userId} is not the owner of message ID ${messageId}.`,
      );

      throw new ForbiddenException();
    }

    this.logger.log(`User with ID ${userId} owns message ID ${messageId}.`);
    return true;
  }
}
