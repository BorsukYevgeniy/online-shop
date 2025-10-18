import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthApiController } from './auth.api.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { AuthSsrController } from './auth.ssr.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [UserModule, TokenModule, MailModule,ConfigModule],
  controllers: [AuthApiController, AuthSsrController],
  providers: [AuthService],
})
export class AuthModule {}
