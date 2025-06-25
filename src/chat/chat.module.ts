import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from 'src/token/token.module';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatSsrController } from './chat-ssr.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TokenModule, PrismaModule],
  controllers: [ChatSsrController],
  providers: [ChatService, ChatRepository, ChatGateway],
})
export class ChatModule {}
