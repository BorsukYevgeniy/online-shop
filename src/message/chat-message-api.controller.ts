import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageNickname } from './types/message.type';

import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';

import { Role } from '../enum/role.enum';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';

@Controller('api/chat/:chatId/messages')
@UseGuards(VerifiedUserGuard)
export class ChatMessageApiController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getMessagesByChatId(@Param('chatId') chatId: number) {
    return await this.messageService.getMessagesByChatId(chatId);
  }

  @Post()
  async createMessage(
    @Req() req: AuthRequest,
    @Param('chatId') chatId: number,
    @Body() createDto: CreateMessageDto,
  ): Promise<MessageNickname> {
    return await this.messageService.createMessage(
      createDto,
      chatId,
      req.user.id,
    );
  }
}
