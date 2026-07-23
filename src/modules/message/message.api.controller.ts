import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { TokenPayload } from '../token/interface/token.interfaces';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';
import { MessageNickname } from './types/message.type';

import { User } from '../../common/decorators/routes/user.decorator';
import { MessageApiControllerDocs, MessageApiRoutesDocs } from './docs';

@MessageApiControllerDocs()
@Controller('api/messages')
@UseGuards(VerifiedUserGuard)
export class MessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @MessageApiRoutesDocs.GetMessageById()
  @Get(':messageId')
  @UseInterceptors(CacheInterceptor)
  async getMessageById(
    @Param('messageId', ParseIntPipe) messageId: number,
    @User() user: TokenPayload,
  ): Promise<Message> {
    return await this.messageService.getMessageById(messageId, user.id);
  }

  @MessageApiRoutesDocs.Update()
  @Patch(':messageId')
  async updateMessage(
    @User() user: TokenPayload,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() updateDto: UpdateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.updateMessage(
      messageId,
      user.id,
      updateDto,
    );
  }

  @MessageApiRoutesDocs.Delete()
  @Delete(':messageId')
  @HttpCode(204)
  async deleteMessage(
    @User() user: TokenPayload,
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<void> {
    await this.messageService.deleteMessage(messageId, user.id);
  }
}
