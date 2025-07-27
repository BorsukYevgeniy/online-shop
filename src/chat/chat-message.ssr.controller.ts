import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Role } from '../enum/role.enum';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';
import { MessageService } from '../message/message.service';
import {
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationDto } from '../dto/pagination.dto';

@ApiTags('SSR ChatMessages')
@ApiCookieAuth('accessToken')
@Controller('chats/:chatId/messages')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class ChatMessageSsrController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Get messages in chat' })
  @ApiOkResponse({ description: 'Messages fetched' })
  @ApiNotFoundResponse({ description: 'Chat not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiParam({ name: 'chatId', type: Number })
  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Render('message/get-all-messages')
  @UseInterceptors(CacheInterceptor)
  async getMessagesByChatId(
    @Param('chatId') chatId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { messages, ...pagination } =
      await this.messageService.getMessagesByChatId(chatId, paginationDto);

    return { messages, chatId, ...pagination };
  }
}
