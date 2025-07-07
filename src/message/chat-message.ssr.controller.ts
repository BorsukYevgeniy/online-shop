import {
  Controller,
  Get,
  Param,
  Render,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Role } from '../enum/role.enum';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SsrExceptionFilter } from '../filter/ssr-exception.filter';

@Controller('chats/:chatId/messages')
@UseGuards(VerifiedUserGuard)
@UseFilters(SsrExceptionFilter)
export class ChatMessageSsrController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Render('message/get-all-messages')
  @UseInterceptors(CacheInterceptor)
  async getMessagesByChatId(@Param('chatId') chatId: number) {
    const messages = await this.messageService.getMessagesByChatId(chatId);

    return { messages, chatId };
  }
}
