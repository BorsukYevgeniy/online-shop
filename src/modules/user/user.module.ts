import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';
import { ProductModule } from '../product/product.module';
import { TokenModule } from '../token/token.module';
import { UserCleaningService } from './user-cleaning.service';
import { UserApiController } from './user.api.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserSsrController } from './user.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule, ProductModule, ChatModule],
  controllers: [UserApiController, UserSsrController],
  providers: [UserService, UserRepository, UserCleaningService],
  exports: [UserService],
})
export class UserModule {}
