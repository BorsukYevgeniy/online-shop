import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Render,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifiedUserGuard } from '../../auth/guards/verified-user.guard';

import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Role } from '../../../common/enum/role.enum';
import { SsrExceptionFilter } from '../../../common/filter/ssr-exception.filter';
import { RequieredRoles } from '../../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../../auth/guards/roles-auth.guard';
import { MessageService } from '../../message/message.service';

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
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { messages, ...pagination } =
      await this.messageService.getMessagesByChatId(chatId, paginationDto);

    return { messages, chatId, ...pagination };
  }
}
