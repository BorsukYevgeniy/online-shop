import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { RoleModule } from 'src/role/role.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [PrismaModule, RoleModule, TokenModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
