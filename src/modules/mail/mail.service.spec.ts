import { TestingModule, Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '../config/config.service';

describe('UserCleaningService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { SMTP_USER: 'USER', APP_URL: '123' } },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should send email', async () => {
    jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

    await expect(
      service.sendVerificationMail('test@gmail.com', '/verify/123'),
    ).resolves.toBe(undefined);
  });
});
