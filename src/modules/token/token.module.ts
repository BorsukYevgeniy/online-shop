import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenCleaningService } from './token-cleaning.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule, ConfigModule],
  providers: [TokenCleaningService, TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
