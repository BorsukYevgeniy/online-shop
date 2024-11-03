import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesRepository } from './roles.repository';
import { RolesController } from './roles.controller';
import { TokensModule } from 'src/token/tokens.module';

@Module({
  imports: [PrismaModule, TokensModule],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {}
