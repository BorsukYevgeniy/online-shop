import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import { ChatMessages, UserChat } from './types/chat.types';
import { Chat } from '@prisma/client';

import { ChatErrorMessages as ChatErrMsg } from './enum/chat-error-message.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getUserChats(userId: number): Promise<UserChat[]> {
    const userChats = await this.chatRepository.getUserChats(userId);

    if (!userChats) throw new NotFoundException(ChatErrMsg.UserChatsNotFound);

    return userChats;
  }

  async getChatById(id: number): Promise<ChatMessages> {
    const chat = await this.chatRepository.getChatById(id);

    if (!chat) throw new NotFoundException(ChatErrMsg.ChatNotFound);

    return chat;
  }

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    return await this.chatRepository.createChat(createDto);
  }

  async deleteChat(chatId: number): Promise<Chat> {
    try {
      return await this.chatRepository.deleteChat(chatId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(ChatErrMsg.ChatNotFound);
      }
    }
  }
}
