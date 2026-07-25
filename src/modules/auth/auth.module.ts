import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../config/app.config';
import { MailModule } from '../../infra/mail/mail.module';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { AuthApiController } from './auth.api.controller';
import { AuthService } from './auth.service';
import { AuthSsrController } from './auth.ssr.controller';
import { AuthMailService } from './mail/auth-mail.service';

@Module({
  imports: [
    UserModule,
    TokenModule,
    MailModule,
    ConfigModule.forFeature(appConfig),
  ],
  controllers: [AuthApiController, AuthSsrController],
  providers: [AuthService, AuthMailService],
})
export class AuthModule {}
