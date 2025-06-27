import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getUserChats(userId: number) {
    return await this.chatRepository.getUserChats(userId);
  }

  async getChatById(id: number) {
    return await this.chatRepository.getChatById(id);
  }

  async createChat(createDto: CreateChatDto) {
    return await this.chatRepository.createChat(createDto);
  }
}
