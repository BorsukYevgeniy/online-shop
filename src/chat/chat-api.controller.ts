import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Chat } from '@prisma/client';
import { ChatMessages, UserChat } from './types/chat.types';
import { CreateChatDto } from './dto/create-chat.dto';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat.dto';

@Controller('api/chats')
@UseGuards(VerifiedUserGuard)
export class ChatApiController {
  constructor(
    private readonly chatService: ChatService,
) {}

  @Get()
  async getMyChats(@Req() req: AuthRequest): Promise<UserChat[]> {
    return await this.chatService.getUserChats(req.user.id);
  }

  @Get(':chatId')
  async getСhatById(@Param('chatId') chatId: number): Promise<ChatMessages> {
    return await this.chatService.getChatById(chatId);
  }

  @Post()
  async createChat(@Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto): Promise<Chat> {
    return await this.chatService.createChat(createDto);
  }

  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: number):Promise<Chat> {
    return await this.chatService.deleteChat(chatId);
  }

}
