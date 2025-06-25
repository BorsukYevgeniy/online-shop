import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import { CreateMessageDto } from './dto/create-message.dto';


@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(createDto: CreateChatDto) {
    return await this.chatRepository.createChat(createDto);
  }

  async getChatById(id: number){
    return await this.chatRepository.getChatById(id)
  }

  async createMessage(createDto:CreateMessageDto){
    return await this.chatRepository.createMessage(createDto)
  }

}
