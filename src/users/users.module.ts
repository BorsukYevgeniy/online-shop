import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { ProductModule } from 'src/products/product.module';
import { RolesModule } from 'src/roles/roles.module';
import { TokensModule } from 'src/token/tokens.module';

@Module({
  imports: [PrismaModule, ProductModule, RolesModule, TokensModule],
  controllers: [UserController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
