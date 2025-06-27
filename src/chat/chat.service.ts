import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';


@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getUserChats(userId:number){
    return await this.chatRepository.getUserChats(userId)
  }

  async getChatById(id: number){
    return await this.chatRepository.getChatById(id)
  }

  async createChat(createDto: CreateChatDto) {
    return await this.chatRepository.createChat(createDto);
  }


  async createMessage(createDto:CreateMessageDto){
    return await this.chatRepository.createMessage(createDto)
  }

  async updateMesssage(messageId: number , updateDto: UpdateMessageDto) {
    return await this.chatRepository.updateMessage(messageId,updateDto)
  }


  async deleteMessage(messageId: number) {
    return await this.chatRepository.deleteMessage(messageId)
  }

}
