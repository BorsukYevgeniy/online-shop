import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Res,
  Param,
  Body,
  Render,
  UseFilters,
  UseInterceptors,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { SsrExceptionFilter } from '../../common/filter/ssr-exception.filter';
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
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TokenPayload } from '../token/interface/token.interfaces';
import { User } from '../../common/decorators/routes/user.decorator';

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
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You must be verified user' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @Get()
  @Render('users/my-chats')
  @UseInterceptors(CacheInterceptor)
  async getAllChats(
    @User() user: TokenPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    const { chats, ...pagination } = await this.chatService.getUserChats(
      user.id,
      paginationDto,
    );

    return { chats, ...pagination };
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
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Res() res: Response,
  ) {
    await this.chatService.deleteChat(chatId, user.id);

    res.redirect('/chats');
  }
}
