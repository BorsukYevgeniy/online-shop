import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from './token.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '@prisma/client';

describe('TokenRepository', () => {
  let tokensRepository: TokenRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepository,
        {
          provide: PrismaService,
          useValue: {
            token: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tokensRepository = module.get<TokenRepository>(TokenRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(tokensRepository).toBeDefined();
  });

  it('should create a new token', async () => {
    const userId = 1;
    const refreshToken = 'refreshToken';
    const expiresAt = new Date();
    const token: Token = {
      id: 1,
      userId,
      token: refreshToken,
      expiresAt,
    };
    jest.spyOn(prismaService.token, 'create').mockResolvedValue(token);

    expect(await tokensRepository.create(userId, refreshToken, expiresAt)).toBe(
      token,
    );
    expect(prismaService.token.create).toHaveBeenCalledWith({
      data: { userId, expiresAt, token: refreshToken },
    });
  });

  it('should find user tokens by userId', async () => {
    const userId = 1;
    const tokens: Token[] = [
      {
        id: 1,
        userId,
        token: 'refreshToken',
        expiresAt: new Date(),
      },
    ];
    jest.spyOn(prismaService.token, 'findMany').mockResolvedValue(tokens);

    expect(await tokensRepository.findUserTokens(userId)).toBe(tokens);
    expect(prismaService.token.findMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('should delete all user tokens by user id', async () => {
    const userId = 1;
    jest
      .spyOn(prismaService.token, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteAllUsersTokens(userId)).toEqual({
      count: 1,
    });
    expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('should delete user tokens by token', async () => {
    const token = 'refreshToken';
    jest
      .spyOn(prismaService.token, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteUserTokens(token)).toEqual({
      count: 1,
    });
    expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
      where: { token },
    });
  });

  it('should delete expired tokens', async () => {
    const now = new Date();
    jest
      .spyOn(prismaService.token, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteExpiredTokens(now)).toEqual({
      count: 1,
    });
    expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: now } },
    });
  });
});
