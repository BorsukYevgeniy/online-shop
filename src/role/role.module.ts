import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoleRepository } from './role.repository';
import { RoleController } from './role.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [PrismaModule, TokenModule],
  providers: [RoleService, RoleRepository],
  exports: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
