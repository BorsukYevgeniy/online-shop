import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async createMessage(createDto: CreateMessageDto) {
    return await this.messageRepository.createMessage(createDto);
  }

  async updateMesssage(messageId: number, updateDto: UpdateMessageDto) {
    return await this.messageRepository.updateMessage(messageId, updateDto);
  }

  async deleteMessage(messageId: number) {
    return await this.messageRepository.deleteMessage(messageId);
  }
}
