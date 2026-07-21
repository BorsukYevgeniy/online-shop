import { Module } from '@nestjs/common';

import { ChatMemberValidationRepository } from './chat-member-validation.repository';
import { ChatMemberValidationService } from './chat-member-validation.service';

import { PrismaModule } from '../../infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChatMemberValidationRepository, ChatMemberValidationService],
  exports: [ChatMemberValidationService],
})
export class ChatMessageModule {}
