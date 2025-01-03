import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('TokenService', () => {
  let service: TokenService;
  let repository: TokenRepository;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: TokenRepository,
          useValue: {
            create: jest.fn(),
            findUserTokens: jest.fn(),
            deleteUserTokens: jest.fn(),
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

    service = module.get<TokenService>(TokenService);
    repository = module.get(TokenRepository);
    jwt = module.get(JwtService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should generate and save tokens', async () => {
    const userId = 1;
    const roles = ['admin'];
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(accessToken);
    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(refreshToken);
    jest.spyOn(repository, 'create').mockResolvedValue({
      id: 1,
      token: refreshToken,
      userId: 1,
      expiresAt: new Date(),
    });

    const result = await service.generateTokens(userId, roles);

    expect(repository.create).toHaveBeenCalledWith(
      userId,
      refreshToken,
      expect.any(Date),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('should verify refresh token', async () => {
    const refreshToken = 'refresh-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyRefreshToken(refreshToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: undefined,
    });
    expect(result).toEqual(payload);
  });

  it('should verify access token', async () => {
    const accessToken = 'access-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyAccessToken(accessToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(accessToken, {
      secret: undefined,
    });
    expect(result).toEqual(payload);
  });

  it('should return user tokens', async () => {
    const userId = 1;
    const tokens = [
      { id: 1, token: 'token', userId: 1, expiresAt: new Date() },
    ];

    jest.spyOn(repository, 'findUserTokens').mockResolvedValue(tokens);

    const result = await service.getUserTokens(userId);

    expect(repository.findUserTokens).toHaveBeenCalledWith(userId);
    expect(result).toEqual(tokens);
  });

  it('should delete user tokens', async () => {
    const token = 'token';

    jest.spyOn(repository, 'deleteUserTokens').mockResolvedValue({ count: 1 });

    await service.deleteUserTokens(token);

    expect(repository.deleteUserTokens).toHaveBeenCalledWith(token);
  });
});
