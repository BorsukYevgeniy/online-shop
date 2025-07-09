import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Param,
  Body,
  Delete,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Chat } from '@prisma/client';
import { ChatMessages, UserChat } from './types/chat.types';
import { CreateChatDto } from './dto/create-chat.dto';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat-dto.pipe';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('api/chats')
@UseGuards(VerifiedUserGuard)
export class ChatApiController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyChats(@Req() req: AuthRequest): Promise<UserChat[]> {
    return await this.chatService.getUserChats(req.user.id);
  }

  @Get(':chatId')
  @UseInterceptors(CacheInterceptor)
  async getСhatById(
    @Param('chatId') chatId: number,
    @Req() req: AuthRequest,
  ): Promise<ChatMessages> {
    return await this.chatService.getChatById(chatId, req.user.id);
  }

  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
  ): Promise<Chat> {
    return await this.chatService.createChat(createDto);
  }

  @Delete(':chatId')
  @HttpCode(204)
  async deleteChat(
    @Req() req: AuthRequest,
    @Param('chatId') chatId: number,
  ): Promise<void> {
    return await this.chatService.deleteChat(chatId, req.user.id);
  }
}
