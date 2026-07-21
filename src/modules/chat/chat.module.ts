import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { ChatMessageModule } from '../chat-message/chat-message.module';
import { MessageModule } from '../message/message.module';
import { TokenModule } from '../token/token.module';
import { ChatMessageApiController } from './chat-message.api.controller';
import { ChatMessageSsrController } from './chat-message.ssr.controller';
import { ChatApiController } from './chat.api.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { ChatSsrController } from './chat.ssr.controller';

@Module({
  imports: [TokenModule, PrismaModule, ChatMessageModule, MessageModule],
  controllers: [
    ChatSsrController,
    ChatApiController,
    ChatMessageApiController,
    ChatMessageSsrController,
  ],
  providers: [ChatService, ChatRepository, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
