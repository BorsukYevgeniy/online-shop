import KeyvRedis from '@keyv/redis';
import { MailerOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import Keyv from 'keyv';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  get PORT(): number {
    return this.nestConfigService.get<number>('PORT');
  }

  get JWT_CONFIG() {
    return {
      JWT_ACCESS_SECRET: this.nestConfigService.get('JWT_ACCESS_SECRET'),
      JWT_REFRESH_SECRET: this.nestConfigService.get('JWT_REFRESH_SECRET'),
      ACCESS_TOKEN_EXPIRATION_TIME: this.nestConfigService.get(
        'ACCESS_TOKEN_EXPIRATION_TIME',
      ),
      REFRESH_TOKEN_EXPIRATION_TIME: this.nestConfigService.get(
        'REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    };
  }

  get MAIL_CONFIG(): MailerOptions {
    return {
      transport: {
        host: this.nestConfigService.get('SMTP_HOST'),
        auth: {
          user: this.nestConfigService.get('SMTP_USER'),
          pass: this.nestConfigService.get('SMTP_PASSWORD'),
        },
      },
    };
  }

  get SMTP_USER() {
      return this.nestConfigService.get('SMTP_USER')
  }

  get APP_URL(): string {
    return this.nestConfigService.get('APP_URL');
  }

  get REDIS_CONFIG() {
    return {
      stores: new Keyv({
        store: new KeyvRedis({ url: this.nestConfigService.get('REDIS_URL') }),
        namespace: '',
        useKeyPrefix: false,
      }),
      ttl: this.nestConfigService.get<number>('REDIS_TTL'),
    };
  }

}
