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

import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Role } from '../../../common/enum/role.enum';
import { SsrExceptionFilter } from '../../../common/filter/ssr-exception.filter';
import { RequieredRoles } from '../../auth/decorator/requiered-roles.decorator';
import { RolesGuard } from '../../auth/guards/roles-auth.guard';
import { MessageService } from '../../message/message.service';
import {
  ChatMessageSsrControllerDocs,
  GetMessagesByChatIdDocs,
} from './docs/ssr';

@ChatMessageSsrControllerDocs()
@Controller('chats/:chatId/messages')
@RequieredRoles(Role.ADMIN)
@UseGuards(RolesGuard)
@UseFilters(SsrExceptionFilter)
@UseInterceptors(CacheInterceptor)
export class ChatMessageSsrController {
  constructor(private readonly messageService: MessageService) {}

  @GetMessagesByChatIdDocs()
  @Get()
  @Render('message/get-all-messages')
  async getMessagesByChatId(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { messages, ...pagination } =
      await this.messageService.getMessagesByChatId(chatId, paginationDto);

    return { messages, chatId, ...pagination };
  }
}
