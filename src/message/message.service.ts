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
import { MessageNickname, PaginatedMessages } from './types/message.type';

import { MessageErrorMessages as MessageErrMsg } from './enum/message-error-messages.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatMemberValidationService } from '../chat-message/chat-member-validation.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MessageService {
  private readonly logger: Logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
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

  async countMessagesInChat(chatId: number): Promise<number> {
    return await this.messageRepository.countMessagesInChat(chatId);
  }

  async getMessagesByChatId(
    chatId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedMessages> {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [messages, totalMessages] = await Promise.all([
      this.messageRepository.getMessagesByChatId(chatId, skip, pageSize),
      this.countMessagesInChat(chatId),
    ]);

    if (!messages) {
      this.logger.warn(`Chat with id ${chatId} not found.`);
    }

    const totalPages: number = Math.ceil(totalMessages / pageSize);

    this.logger.log(
      'Chat fetched successfully, totalMessages messages: ' + totalMessages,
    );

    return {
      messages,
      total: totalMessages,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async createMessage(
    createDto: CreateMessageDto,
    chatId: number,
    userId: number,
  ): Promise<MessageNickname> {
    await this.validationService.validateChatMembers(chatId, userId);

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
