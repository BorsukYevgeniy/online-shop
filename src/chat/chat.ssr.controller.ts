import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Req,
  Res,
  Param,
  Body,
  Render,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat-dto.pipe';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('chats')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class ChatSsrController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
    @Res() res: Response,
  ) {
    const chat = await this.chatService.createChat(createDto);

    res.redirect(`/chats/${chat.id}`);
  }

  @Get()
  @Render('users/my-chats')
  @UseInterceptors(CacheInterceptor)
  async getAllChats(@Req() req: AuthRequest) {
    const chats = await this.chatService.getUserChats(req.user.id);

    return { chats };
  }

  @Get(':chatId')
  @Render('chat/get-chat-by-id')
  async getChatById(@Param('chatId') chatId: number, @Req() req: AuthRequest) {
    const chat = await this.chatService.getChatById(chatId, req.user.id);

    return { chatId: chat.id, messages: chat.messages, userId: req.user.id };
  }

  @Delete(':chatId')
  async handleDeleteChat(
    @Req() req: AuthRequest,
    @Param('chatId') chatId: number,
    @Res() res: Response,
  ) {
    await this.chatService.deleteChat(chatId, req.user.id);

    res.redirect('/chats');
  }
}
