import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { MessageApiController } from './message-api.controller';
import { ChatMessageApiController } from './chat-message-api.controller';
import { ChatMessageSsrController } from './chat-message-ssr.controller';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [
    MessageApiController,
    ChatMessageApiController,
    ChatMessageSsrController,
  ],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
