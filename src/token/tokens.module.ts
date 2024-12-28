import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenCleaningService } from './tokens-cleaning.service';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule],
  providers: [TokenCleaningService, TokensService, TokensRepository],
  exports: [TokensService],
})
export class TokensModule {}
