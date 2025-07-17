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
import {
  ApiTags,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('SSR Chats')
@ApiCookieAuth('accessToken')
@Controller('chats')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class ChatSsrController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Fetch chat by id' })
  @ApiOkResponse({ description: 'Chat fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiBody({ type: CreateChatDto })
  @Post()
  async createChat(
    @Body(ValidateCreateChatDtoPipe) createDto: CreateChatDto,
    @Res() res: Response,
  ) {
    const chat = await this.chatService.createChat(createDto);

    res.redirect(`/chats/${chat.id}`);
  }

  @ApiOperation({ summary: 'Fecth my chats' })
  @ApiOkResponse({ description: 'Message fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @Get()
  @Render('users/my-chats')
  @UseInterceptors(CacheInterceptor)
  async getAllChats(@Req() req: AuthRequest) {
    const chats = await this.chatService.getUserChats(req.user.id);

    return { chats };
  }

  @ApiOperation({ summary: 'Fetch chat by id' })
  @ApiOkResponse({ description: 'Chat fetched' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'You isnt participant of chat or you must be verified user',
  })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiParam({ name: 'chatId', type: Number })
  @Get(':chatId')
  @Render('chat/get-chat-by-id')
  async getChatById(@Param('chatId') chatId: number, @Req() req: AuthRequest) {
    const chat = await this.chatService.getChatById(chatId, req.user.id);

    return { chatId: chat.id, messages: chat.messages, userId: req.user.id };
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
  async handleDeleteChat(
    @Req() req: AuthRequest,
    @Param('chatId') chatId: number,
    @Res() res: Response,
  ) {
    await this.chatService.deleteChat(chatId, req.user.id);

    res.redirect('/chats');
  }
}
