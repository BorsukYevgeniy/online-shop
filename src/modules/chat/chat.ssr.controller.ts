import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Render,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { TokenPayload } from '../token/interface/token.interfaces';
import { ChatService } from './chat.service';
import { ChatSsrControllerDocs, ChatSsrRoutesDocs } from './docs/ssr';
import { CreateChatDto } from './dto/create-chat.dto';
import { ValidateCreateChatDtoPipe } from './pipe/validate-create-chat-dto.pipe';

@ChatSsrControllerDocs()
@Controller('chats')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class ChatSsrController {
  constructor(private readonly chatService: ChatService) {}

  @ChatSsrRoutesDocs.HandleCreateChat()
  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
    @Res() res: Response,
  ) {
    const chat = await this.chatService.createChat(createDto);

    res.redirect(`/chats/${chat.id}`);
  }

  @ChatSsrRoutesDocs.GetMyChats()
  @Get()
  @Render('users/my-chats')
  @UseInterceptors(CacheInterceptor)
  async getMyChats(
    @User() user: TokenPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const { chats, ...pagination } = await this.chatService.getUserChats(
      user.id,
      paginationDto,
    );

    return { chats, ...pagination };
  }

  @ChatSsrRoutesDocs.GetById()
  @Get(':chatId')
  @Render('chat/get-chat-by-id')
  async getChatById(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
    @User() user: TokenPayload,
  ) {
    const { chat, ...pagination } = await this.chatService.getChatById(
      chatId,
      user.id,
      paginationDto,
    );

    return {
      ...chat,
      ...pagination,
      userId: user.id,
    };
  }

  @ChatSsrRoutesDocs.HandleDeleteChat()
  @Delete(':chatId')
  async handleDeleteChat(
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Res() res: Response,
  ) {
    await this.chatService.deleteChat(chatId, user.id);

    res.redirect('/chats');
  }
}
