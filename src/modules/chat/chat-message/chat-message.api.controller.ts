import { CacheInterceptor } from '@nestjs/cache-manager';
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
import { User } from '../../../common/decorators/routes/user.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Role } from '../../../common/enum/role.enum';
import { RequieredRoles } from '../../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../../auth/guards/roles-auth.guard';
import { VerifiedUserGuard } from '../../auth/guards/verified-user.guard';
import { CreateMessageDto } from '../../message/dto/create-message.dto';
import { MessageService } from '../../message/message.service';
import {
  MessageNickname,
  PaginatedMessages,
} from '../../message/types/message.type';
import { TokenPayload } from '../../token/interface/token.interfaces';
import {
  ChatMessageApiControllerDocs,
  ChatMessageApiRoutesDocs,
} from './docs/api';

@ChatMessageApiControllerDocs()
@Controller('api/chats/:chatId/messages')
@UseGuards(VerifiedUserGuard)
export class ChatMessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @ChatMessageApiRoutesDocs.GetAllMessages()
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

  @ChatMessageApiRoutesDocs.CreatMessage()
  @Post()
  async createMessage(
    @User() user: TokenPayload,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() createDto: CreateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.createMessage(createDto, chatId, user.id);
  }
}
