import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { Role } from '../../common/enum/role.enum';
import { Token } from '@prisma/client';

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
            findUserTokens: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteUserToken: jest.fn(),
            deleteAllUsersTokens: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            JWT_CONFIG: {
              JWT_ACCESS_SECRET: '123',
              JWT_REFRESH_SECRET: '321',
              ACCESS_TOKEN_EXPIRATION_TIME: '1d',
              REFRESH_TOKEN_EXPIRATION_TIME: '3d',
            },
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    repository = module.get<TokenRepository>(TokenRepository);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should generate and save tokens', async () => {
    const userId = 1;
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

    const result = await service.generateTokens({
      id: userId,
      role: Role.ADMIN,
      isVerified: false,
    });

    expect(repository.create).toHaveBeenCalledWith(
      userId,
      refreshToken,
      expect.any(Date),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('Should verify refresh token', async () => {
    const refreshToken = 'refresh-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyRefreshToken(refreshToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: '321',
    });
    expect(result).toEqual(payload);
  });

  it('Should verify access token', async () => {
    const accessToken = 'access-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyAccessToken(accessToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(accessToken, {
      secret: '123',
    });
    expect(result).toEqual(payload);
  });

  it('Should return user tokens', async () => {
    const userId = 1;
    const tokens = [
      { id: 1, token: 'token', userId: 1, expiresAt: new Date() },
    ];

    jest.spyOn(repository, 'findUserTokens').mockResolvedValue(tokens);

    const result = await service.getUserTokens(userId);

    expect(repository.findUserTokens).toHaveBeenCalledWith(userId);
    expect(result).toEqual(tokens);
  });

  it('Should update token', async () => {
    const token = 'token';
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    jest
      .spyOn(jwt, 'verifyAsync')
      .mockResolvedValueOnce({ id: 1, role: Role.USER, isVerified: true });

    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(refreshToken);
    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(accessToken);
    jest
      .spyOn(repository, 'update')
      .mockResolvedValue({ token: '123' } as Token);

    const newTokens = await service.updateTokens(token);
    expect(repository.update).toHaveBeenCalledWith(
      token,
      refreshToken,
      expect.any(Date),
    );
    expect(newTokens).toEqual({ accessToken, refreshToken });
  });

  it('Should delete all user tokens', async () => {
    const userId = 1;

    jest.spyOn(repository, 'deleteUserToken').mockResolvedValue({} as Token);

    await service.deleteAllUsersTokens(userId);

    expect(repository.deleteAllUsersTokens).toHaveBeenCalledWith(userId);
  });

  it('Should delete user tokens', async () => {
    const token = 'token';

    jest.spyOn(repository, 'deleteUserToken').mockResolvedValue({} as Token);

    await service.deleteUserToken(token);

    expect(repository.deleteUserToken).toHaveBeenCalledWith(token);
  });
});
