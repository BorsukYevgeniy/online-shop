import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import { ChatMessages, UserChat } from './types/chat.types';
import { Chat } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getUserChats(userId: number): Promise<UserChat[]> {
    return await this.chatRepository.getUserChats(userId);
  }

  async getChatById(id: number): Promise<ChatMessages> {
    return await this.chatRepository.getChatById(id);
  }

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    return await this.chatRepository.createChat(createDto);
  }
}
