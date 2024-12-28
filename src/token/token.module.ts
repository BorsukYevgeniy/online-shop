import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenCleaningService } from './token-cleaning.service';

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule],
  providers: [TokenCleaningService, TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
