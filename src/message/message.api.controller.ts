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
import { MessageService } from './message.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { Message } from '@prisma/client';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageNickname } from './types/message.type';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthRequest } from 'src/common/types/request.type';
import { TokenPayload } from '../../dist/token/interface/token.interfaces';

import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { User } from '../decorators/routes/user.decorator';


@ApiTags('API Messages')
@ApiCookieAuth('accessToken')
@Controller('api/messages')
@UseGuards(VerifiedUserGuard)
export class MessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Get message by id' })
  @ApiOkResponse({ description: 'Message fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiParam({ name: 'messageId', type: Number })
  @Get(':messageId')
  @UseInterceptors(CacheInterceptor)
  async getMessageById(
    @Param('messageId', ParseIntPipe) messageId: number,
@User() user: TokenPayload,
  ): Promise<Message> {
    return await this.messageService.getMessageById(messageId, user.id);
  }

  @ApiOperation({ summary: 'Update message by id' })
  @ApiOkResponse({ description: 'Message updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiParam({ name: 'messageId', type: Number })
  @ApiBody({ type: UpdateMessageDto })
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

  @ApiOperation({ summary: 'Delete message by id' })
  @ApiNoContentResponse({ description: 'Message deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiParam({ name: 'messageId', type: Number })
  @Delete(':messageId')
  @HttpCode(204)
  async deleteMessage(
@User() user: TokenPayload,
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<void> {
    await this.messageService.deleteMessage(messageId, user.id);
  }
}
