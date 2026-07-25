import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from '../../config/app.config';

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
  ) {}

  async sendVerificationMail(to: string, link: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Verification mail on ' + this.appConf.appUrl,
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
