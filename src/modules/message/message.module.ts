import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { ChatValidationModule } from '../chat/validation/chat-validation.module';
import { TokenModule } from '../token/token.module';
import { MessageApiController } from './message.api.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule, TokenModule, ChatValidationModule],
  controllers: [MessageApiController],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
