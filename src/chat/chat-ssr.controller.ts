import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  Param,
  Body,
  Render,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/types/request.type';

@Controller('chat')
export class ChatSsrController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  async createChat(@Body() createDto: CreateChatDto, @Res() res: Response) {
    const chat = await this.chatService.createChat(createDto);

    console.log(createDto)


    res.redirect(`/chat/${chat.id}`);
  }

  @Get(':chatId')
  @UseGuards(AuthGuard)
  @Render('chat/get-chat-by-id')
  async getChatById(@Param('chatId') chatId: number, @Req() req: AuthRequest) {
    const chat = await this.chatService.getChatById(chatId);

    return { chatId: chat.id, messages: chat.messages, userId: req.user.id };
  }
}
