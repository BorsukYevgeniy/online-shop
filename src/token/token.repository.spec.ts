import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from './token.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '@prisma/client';

describe('TokenRepository', () => {
  let tokensRepository: TokenRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepository,
        {
          provide: PrismaService,
          useValue: {
            token: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tokensRepository = module.get<TokenRepository>(TokenRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(tokensRepository).toBeDefined();
  });

  it('Should create a new token', async () => {
    const userId = 1;
    const refreshToken = 'refreshToken';
    const expiresAt = new Date();
    const token: Token = {
      id: 1,
      userId,
      token: refreshToken,
      expiresAt,
    };
    jest.spyOn(prisma.token, 'create').mockResolvedValue(token);

    expect(await tokensRepository.create(userId, refreshToken, expiresAt)).toBe(
      token,
    );
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: { userId, expiresAt, token: refreshToken },
    });
  });

  it('Should update token', async () => {
    jest
      .spyOn(prisma.token, 'update')
      .mockResolvedValue({ token: 'newRefreshToken' } as Token);

    const token = await tokensRepository.update(
      'token',
      'newRefreshToken',
      new Date(),
    );

    expect(token).toEqual({ token: 'newRefreshToken' });
  });

  it('Should find user tokens by userId', async () => {
    const userId = 1;
    const tokens: Token[] = [
      {
        id: 1,
        userId,
        token: 'refreshToken',
        expiresAt: new Date(),
      },
    ];
    jest.spyOn(prisma.token, 'findMany').mockResolvedValue(tokens);

    expect(await tokensRepository.findUserTokens(userId)).toBe(tokens);
    expect(prisma.token.findMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('Should delete all user tokens by user id', async () => {
    const userId = 1;
    jest.spyOn(prisma.token, 'deleteMany').mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteAllUsersTokens(userId)).toEqual({
      count: 1,
    });
    expect(prisma.token.deleteMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('Should delete user tokens by token', async () => {
    const token = 'refreshToken';
    jest.spyOn(prisma.token, 'delete').mockResolvedValue({} as Token);

    expect(await tokensRepository.deleteUserToken(token)).toEqual({} as Token);
    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: { token },
    });
  });

  it('Should delete expired tokens', async () => {
    jest.spyOn(prisma.token, 'deleteMany').mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteExpiredTokens()).toEqual({
      count: 1,
    });
    expect(prisma.token.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: expect.any(Date) } },
    });
  });
});
