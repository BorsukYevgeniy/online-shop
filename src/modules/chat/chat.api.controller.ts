import {
  Controller,
  Get,
  Post,
  UseGuards,

  Param,
  Body,
  Delete,
  UseInterceptors,
  HttpCode,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthRequest } from '../../common/types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Chat } from '@prisma/client';
import {
  ChatMessages,
  PaginatedChat,
  PaginatedUserChats,
  UserChat,
} from './types/chat.types';
import { CreateChatDto } from './dto/create-chat.dto';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat-dto.pipe';
import { CacheInterceptor } from '@nestjs/cache-manager';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../common/decorators/routes/user.decorator';
import { TokenPayload } from '../token/interface/token.interfaces';

@ApiTags('API Chats')
@ApiCookieAuth('accessToken')
@Controller('api/chats')
@UseGuards(VerifiedUserGuard)
export class ChatApiController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Fecth my chats' })
  @ApiOkResponse({ description: 'Message fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyChats(
    @User() user: TokenPayload,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedUserChats> {
    return await this.chatService.getUserChats(user.id, paginationDto);
  }

  @ApiOperation({ summary: 'Fetch chat by id' })
  @ApiOkResponse({ description: 'Chat fetched' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You isnt participant of chat or you must be verified user',
  })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiParam({ name: 'chatId', type: Number })
  @ApiQuery({ type: PaginationDto })
  @Get(':chatId')
  @UseInterceptors(CacheInterceptor)
  async getСhatById(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
    @User() user: TokenPayload,
  ): Promise<PaginatedChat> {
    return await this.chatService.getChatById(
      chatId,
      user.id,
      paginationDto,
    );
  }

  @ApiOperation({ summary: 'Fetch chat by id' })
  @ApiOkResponse({ description: 'Chat fetched' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiBody({ type: CreateChatDto })
  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
  ): Promise<Chat> {
    return await this.chatService.createChat(createDto);
  }

  @ApiOperation({ summary: 'Delete chat by id' })
  @ApiOkResponse({ description: 'Chat delete' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You isnt participant of chat or you must be verified user',
  })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiParam({ name: 'chatId', type: Number })
  @Delete(':chatId')
  @HttpCode(204)
  async deleteChat(
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<void> {
    return await this.chatService.deleteChat(chatId, user.id);
  }
}
