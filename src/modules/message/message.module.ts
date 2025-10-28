import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { MessageApiController } from './message.api.controller';
import { TokenModule } from '../token/token.module';
import { ChatMessageModule } from '../chat-message/chat-message.module';

@Module({
  imports: [PrismaModule, TokenModule, ChatMessageModule],
  controllers: [MessageApiController],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
