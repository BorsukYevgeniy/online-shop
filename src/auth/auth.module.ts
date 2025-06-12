import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthApiController } from './auth.api.controller';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { AuthSsrController } from './auth.ssr.controller';

@Module({
  imports: [UserModule, TokenModule, MailModule],
  controllers: [AuthApiController, AuthSsrController],
  providers: [AuthService],
})
export class AuthModule {}
