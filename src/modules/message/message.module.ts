import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { ChatMessageModule } from '../chat/chat-message/chat-message.module';
import { TokenModule } from '../token/token.module';
import { MessageApiController } from './message.api.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule, TokenModule, ChatMessageModule],
  controllers: [MessageApiController],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
