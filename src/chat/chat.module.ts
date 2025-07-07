import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatSsrController } from './chat.ssr.controller';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/message/message.module';
import { ChatApiController } from './chat.api.controller';

@Module({
  imports: [TokenModule, PrismaModule, MessageModule],
  controllers: [ChatSsrController, ChatApiController],
  providers: [ChatService, ChatRepository, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
