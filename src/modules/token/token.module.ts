import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { TokenCleaningService } from './token-cleaning.service';
import { TokenRepository } from './token.repository';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule, ConfigModule],
  providers: [TokenCleaningService, TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
