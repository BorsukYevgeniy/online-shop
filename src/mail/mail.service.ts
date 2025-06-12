import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);

  private readonly SMTP_USER: string;
  private readonly API_URL: string;
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.SMTP_USER = this.configService.get<string>('SMTP_USER');
    this.API_URL = this.configService.get<string>('API_URL');
  }

  async sendVerificationMail(to: string, link: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      from: this.SMTP_USER,
      subject: 'Verification mail on ' + this.API_URL,
      text: '',
      html: `
      <div>
        <h1>For verification go to</h1>
        <a href="${link}">${link}</a>
      </div>
      `,
    });

    this.logger.log(`Email with link: ${link} sended succesfully`);
  }
}
