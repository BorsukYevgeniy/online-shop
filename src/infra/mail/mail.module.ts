import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../../modules/config/config.module';
import { ConfigService } from '../../modules/config/config.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.MAIL_CONFIG,
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
