import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from '../../config/app.config';
import smtpConfig from '../../config/smtp.config';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(smtpConfig)],
      inject: [smtpConfig.KEY],
      useFactory: (config: ConfigType<typeof smtpConfig>) => config,
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
