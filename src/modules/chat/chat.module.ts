import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { MessageModule } from '../message/message.module';
import { TokenModule } from '../token/token.module';
import { ChatMessageApiController } from './chat-message/chat-message.api.controller';
import { ChatMessageSsrController } from './chat-message/chat-message.ssr.controller';
import { ChatApiController } from './chat.api.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatSsrController } from './chat.ssr.controller';
import { ChatRepositoryModule } from './repository/chat-repository.module';
import { ChatValidationModule } from './validation/chat-validation.module';

@Module({
  imports: [
    TokenModule,
    PrismaModule,
    ChatRepositoryModule,
    ChatValidationModule,
    MessageModule,
  ],
  controllers: [
    ChatSsrController,
    ChatApiController,
    ChatMessageSsrController,
    ChatMessageApiController,
  ],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
