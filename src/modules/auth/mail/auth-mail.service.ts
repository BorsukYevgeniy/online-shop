import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from '../../../config/app.config';
import { MailService } from '../../../infra/mail/mail.service';

@Injectable()
export class AuthMailService {
  private readonly logger: Logger = new Logger(AuthMailService.name);

  constructor(
    @Inject(appConfig) private readonly appConf: ConfigType<typeof appConfig>,
    private readonly mailService: MailService,
  ) {}

  async sendVerificationMail(to: string, link: string): Promise<void> {
    await this.mailService.sendMail(
      to,
      'Verification mail on ' + this.appConf.appUrl,
      `
      <div>
        <h1>For verification go to</h1>
        <a href="${link}">${link}</a>
      </div>
      `,
    );

    this.logger.log(`Email with link: ${link} sended succesfully`);
  }
}
