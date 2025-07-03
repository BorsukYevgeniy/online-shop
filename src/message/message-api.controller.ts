import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { Message } from '@prisma/client';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageNickname } from './types/message.type';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('api/messages')
@UseGuards(VerifiedUserGuard)
export class MessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':messageId')
  @UseInterceptors(CacheInterceptor)
  async getMessageById(@Param('messageId') messageId: number) {
    return await this.messageService.getMessageById(messageId);
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: number,
    @Body() updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.updateMesssage(messageId, updateDto);
  }

  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: number): Promise<Message> {
    return await this.messageService.deleteMessage(messageId);
  }
}
