import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenCleanupService } from './tokens-cleanup.service';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule],
  providers: [TokenCleanupService, TokensService, TokensRepository],
  exports: [TokensService],
})
export class TokensModule {}
