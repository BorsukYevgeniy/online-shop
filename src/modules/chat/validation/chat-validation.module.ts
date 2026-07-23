import { Module } from '@nestjs/common';
import { ChatRepositoryModule } from '../repository/chat-repository.module';
import { ChatMemberValidationService } from './chat-member-validation.service';

@Module({
  imports: [ChatRepositoryModule],
  providers: [ChatMemberValidationService],
  exports: [ChatMemberValidationService],
})
export class ChatValidationModule {}
