import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { TokenCleaningService } from './token-cleaning.service';
import { TokenRepository } from './token.repository';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [TokenCleaningService, TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
