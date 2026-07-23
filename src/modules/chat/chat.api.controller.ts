import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { ChatService } from './chat.service';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { Chat } from '@prisma/client';
import { CreateChatDto } from './dto/create-chat.dto';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat-dto.pipe';
import { PaginatedChat, PaginatedUserChats } from './types/chat.types';

import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TokenPayload } from '../token/interface/token.interfaces';
import { ChatApiControllerDocs, ChatApiRoutesDocs } from './docs/api';

@ChatApiControllerDocs()
@Controller('api/chats')
@UseGuards(VerifiedUserGuard)
export class ChatApiController {
  constructor(private readonly chatService: ChatService) {}

  @ChatApiRoutesDocs.GetMyChats()
  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyChats(
    @User() user: TokenPayload,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedUserChats> {
    return await this.chatService.getUserChats(user.id, paginationDto);
  }

  @ChatApiRoutesDocs.GetById()
  @Get(':chatId')
  @UseInterceptors(CacheInterceptor)
  async getСhatById(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
    @User() user: TokenPayload,
  ): Promise<PaginatedChat> {
    return await this.chatService.getChatById(chatId, user.id, paginationDto);
  }

  @ChatApiRoutesDocs.Create()
  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
  ): Promise<Chat> {
    return await this.chatService.createChat(createDto);
  }

  @ChatApiRoutesDocs.Delete()
  @Delete(':chatId')
  @HttpCode(204)
  async deleteChat(
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<void> {
    return await this.chatService.deleteChat(chatId, user.id);
  }
}
