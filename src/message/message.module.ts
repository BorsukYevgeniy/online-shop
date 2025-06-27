import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule],
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
