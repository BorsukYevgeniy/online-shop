import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserApiController } from './user.api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './user.repository';
import { TokenModule } from '../token/token.module';
import { ProductModule } from '../product/product.module';
import { UserCleaningService } from './user-cleaning.service';
import { UserSsrController } from './user.ssr.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, TokenModule, ProductModule,ChatModule],
  controllers: [UserApiController, UserSsrController],
  providers: [UserService, UserRepository, UserCleaningService],
  exports: [UserService],
})
export class UserModule {}
