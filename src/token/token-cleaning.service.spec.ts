import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { TokenRepository } from "./token.repository";
import { TokenCleaningService } from "./token-cleaning.service";

describe('TokenCleaningService', () => {
  let service: TokenCleaningService;
  let repository: TokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCleaningService,
        {
          provide: TokenRepository,
          useValue: {
            deleteExpiredTokens: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TokenCleaningService>(TokenCleaningService);
    repository = module.get<TokenRepository>(TokenRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  })

  it('should delete expired token', async () => {
    const result = { count: 1 }
    jest.spyOn(repository, 'deleteExpiredTokens').mockResolvedValue(result);

    await service.cleanExpiredTokens();
    expect(repository.deleteExpiredTokens).toHaveBeenCalled();
  })
})