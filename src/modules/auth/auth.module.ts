import { Module } from '@nestjs/common';
import { MailModule } from '../../infra/mail/mail.module';
import { ConfigModule } from '../config/config.module';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthApiController } from './auth.api.controller';
import { AuthService } from './auth.service';
import { AuthSsrController } from './auth.ssr.controller';

@Module({
  imports: [UserModule, TokenModule, MailModule, ConfigModule],
  controllers: [AuthApiController, AuthSsrController],
  providers: [AuthService],
})
export class AuthModule {}
