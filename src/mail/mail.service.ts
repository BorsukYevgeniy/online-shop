import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationMail(to: string, link: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      from: this.configService.SMTP_USER,
      subject: 'Verification mail on ' + this.configService.APP_URL,
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
