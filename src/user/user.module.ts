import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { ProductModule } from 'src/product/product.module';
import { RoleModule } from 'src/roles/role.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [PrismaModule, ProductModule, RoleModule, TokenModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
