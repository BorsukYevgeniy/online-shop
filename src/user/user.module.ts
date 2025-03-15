import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './user.repository';
import { RoleModule } from '../role/role.module';
import { TokenModule } from '../token/token.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [PrismaModule, RoleModule, TokenModule, ProductModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
