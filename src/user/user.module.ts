import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserApiController } from './user.api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './user.repository';
import { TokenModule } from '../token/token.module';
import { ProductModule } from '../product/product.module';
import { UserCleaningService } from './user-cleaning.service';
import { UserSsrController } from './user.ssr.controller';

@Module({
  imports: [PrismaModule, TokenModule, ProductModule],
  controllers: [UserApiController, UserSsrController],
  providers: [UserService, UserRepository, UserCleaningService],
  exports: [UserService],
})
export class UserModule {}
