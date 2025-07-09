import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { Message } from '@prisma/client';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageNickname } from './types/message.type';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthRequest } from 'src/types/request.type';

@Controller('api/messages')
@UseGuards(VerifiedUserGuard)
export class MessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':messageId')
  @UseInterceptors(CacheInterceptor)
  async getMessageById(
    @Param('messageId') messageId: number,
    @Req() req: AuthRequest,
  ): Promise<Message> {
    return await this.messageService.getMessageById(messageId, req.user.id);
  }

  @Patch(':messageId')
  async updateMessage(
    @Req() req: AuthRequest,
    @Param('messageId') messageId: number,
    @Body() updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.updateMessage(
      messageId,
      req.user.id,
      updateDto,
    );
  }

  @Delete(':messageId')
  @HttpCode(204)
  async deleteMessage(
    @Req() req: AuthRequest,
    @Param('messageId') messageId: number,
  ): Promise<void> {
    await this.messageService.deleteMessage(messageId, req.user.id);
  }
}
