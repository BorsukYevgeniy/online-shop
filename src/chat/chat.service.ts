import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import {
  ChatMessages,
  PaginatedChat,
  PaginatedUserChats,
  UserChat,
} from './types/chat.types';
import { Chat } from '@prisma/client';

import { ChatErrorMessages as ChatErrMsg } from './enum/chat-error-message.enum';
import { UserErrorMessages as UserErrMsg } from '../user/constants/user-error-messages.constants';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatMemberValidationService } from '../chat-message/chat-member-validation.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MessageService } from '../message/message.service';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly validationService: ChatMemberValidationService,
    private readonly messageService: MessageService,
  ) {}

  async findChatBetweenUsers(
    sellerId: number,
    buyerId: number,
  ): Promise<Chat | null> {
    const chat = await this.chatRepository.findChatBetweenUsers(
      sellerId,
      buyerId,
    );

    if (!chat) {
      this.logger.warn(
        `No chat found between user ${buyerId} and user ${sellerId}.`,
      );
      return null;
    }

    this.logger.log(`Chat found between user ${buyerId} and user ${sellerId}.`);
    return chat;
  }
  async getUserChats(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedUserChats> {
    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [chats, total] = await Promise.all([
      this.chatRepository.getUserChats(userId, skip, pageSize),
      this.chatRepository.countUserChats(userId),
    ]);

    if (!chats) {
      this.logger.warn(`User with ID ${userId} has no chats.`);
    }

    const totalPages: number = Math.ceil(total / pageSize);

    this.logger.log(`User with ID ${userId} has ${chats.length} chats.`);

    return {
      chats,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getChatById(
    id: number,
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedChat> {
    await this.validationService.validateChatMembers(id, userId);

    const { page, pageSize } = paginationDto;
    const skip = (page - 1) * pageSize;

    const [chat, totalMessages] = await Promise.all([
      this.chatRepository.getChatById(id, skip, pageSize),
      this.messageService.countMessagesInChat(id),
    ]);

    if (!chat) {
      this.logger.warn(`Chat with ID ${id} not found.`);
      throw new NotFoundException(ChatErrMsg.ChatNotFound);
    }

    const totalPages: number = Math.ceil(totalMessages / pageSize);

    this.logger.log(
      'Chat fetched successfully, totalMessages messages: ' + totalMessages,
    );

    return {
      chat: chat,
      total: totalMessages,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    try {
      const chat = await this.chatRepository.createChat(createDto);

      this.logger.log(
        `Chat created successfully between user ${createDto.buyerId} and user ${createDto.sellerId}.`,
      );
      return chat;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(
          `User with ID ${createDto.buyerId} or ${createDto.sellerId} not found.`,
        );
        throw new NotFoundException(UserErrMsg.UserNotFound);
      }
    }
  }

  async deleteChat(chatId: number, userId: number): Promise<void> {
    await this.validationService.validateChatMembers(chatId, userId);

    try {
      this.logger.log(`Deleting chat with ID ${chatId}.`);

      return await this.chatRepository.deleteChat(chatId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Chat with ID ${chatId} not found for deletion.`);
        throw new NotFoundException(ChatErrMsg.ChatNotFound);
      }
    }
  }
}
