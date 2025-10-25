import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import {
  MessageNickname,
  PaginatedMessages,
} from '../message/types/message.type';

import { AuthRequest } from '../common/types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Role } from '../common/enum/role.enum';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiTags,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

@ApiTags('API ChatMessages')
@ApiCookieAuth('accessToken')
@Controller('api/chats/:chatId/messages')
@UseGuards(VerifiedUserGuard)
export class ChatMessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Get messages in chat' })
  @ApiOkResponse({ description: 'Messages fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'chatId', type: Number })
  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getMessagesByChatId(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedMessages> {
    return await this.messageService.getMessagesByChatId(chatId, paginationDto);
  }

  @ApiOperation({ summary: 'Create message in chat' })
  @ApiOkResponse({ description: 'Message created' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'chatId', type: Number })
  @ApiBody({ type: CreateMessageDto })
  @Post()
  async createMessage(
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() createDto: CreateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.createMessage(createDto, chatId, user.id);
  }
}
